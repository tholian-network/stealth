
#define _GNU_SOURCE
#include <unistd.h>
#define _POSIX_C_SOURCE 200809L
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <pthread.h>
#include <signal.h>
#include <sys/select.h>
#include <arpa/inet.h>
#include <errno.h>
#include <limits.h>
#include "proxy.h"
#include "sblist.h"

#ifndef MAX
#define MAX(x, y) ((x) > (y) ? (x) : (y))
#endif

#if !defined(PTHREAD_STACK_MIN) || defined(__APPLE__)
#undef PTHREAD_STACK_MIN
#define PTHREAD_STACK_MIN 64*1024
#elif defined(__GLIBC__)
#undef PTHREAD_STACK_MIN
#define PTHREAD_STACK_MIN 32*1024
#endif

static const struct server* server;
static union sockaddr_union bind_addr = {.v4.sin_family = AF_UNSPEC};

enum socksstate {
	SS_HANDSHAKE,
	SS_CONNECT
};

enum errorcode {
	EC_SUCCESS                   = 0,
	EC_GENERAL_FAILURE           = 1,
	EC_NOT_ALLOWED               = 2,
	EC_NET_UNREACHABLE           = 3,
	EC_HOST_UNREACHABLE          = 4,
	EC_CONN_REFUSED              = 5,
	EC_TTL_EXPIRED               = 6,
	EC_COMMAND_NOT_SUPPORTED     = 7,
	EC_ADDRESSTYPE_NOT_SUPPORTED = 8
};

struct thread {
	pthread_t pt;
	struct client client;
	enum socksstate state;
	volatile int  done;
};



static int connect_socks_target (unsigned char *buf, size_t n, struct client *client) {

	if (n < 5) {
		return -EC_GENERAL_FAILURE;
	}

	if (buf[0] != 5) {
		return -EC_GENERAL_FAILURE;
	}

	if (buf[1] != 1) {
		return -EC_COMMAND_NOT_SUPPORTED;
	}

	if (buf[2] != 0) {
		return -EC_GENERAL_FAILURE;
	}


	int af = AF_INET;
	size_t minlen = 4 + 4 + 2;
	size_t l = 0;
	char namebuf[256];
	struct addrinfo* remote;


	if (buf[3] == 4) {

		// IPv6

		af = AF_INET6;
		minlen = 4 + 2 + 16;

		if (n < minlen) {
			return -EC_GENERAL_FAILURE;
		}

		if (namebuf != inet_ntop(af, buf + 4, namebuf, sizeof namebuf)) {
			return -EC_GENERAL_FAILURE;
		}

	} else if (buf[3] == 1) {

		// IPv4

		if (n < minlen) {
			return -EC_GENERAL_FAILURE;
		}

		if (namebuf != inet_ntop(af, buf + 4, namebuf, sizeof namebuf)) {
			return -EC_GENERAL_FAILURE;
		}

	} else if (buf[3] == 3) {

		// Hostname

		l = buf[4];
		minlen = 4 + 2 + l + 1;

		if (n < minlen) {
			return -EC_GENERAL_FAILURE;
		}

		memcpy(namebuf, buf + 4 + 1, l);
		namebuf[l] = 0;

	} else {

		return -EC_ADDRESSTYPE_NOT_SUPPORTED;

	}


	unsigned short port;
	port = (buf[minlen - 2] << 8) | buf[minlen - 1];


	// No suitable EC in RFC1928 for lookup failure
	if (resolve(namebuf, port, &remote)) {
		return -EC_GENERAL_FAILURE;
	}


	int fd = socket(remote->ai_addr->sa_family, SOCK_STREAM, 0);
	if (fd == -1) {

		eval_errno:

		if (fd != -1) {
			close(fd);
		}

		freeaddrinfo(remote);

		switch (errno) {
			case ETIMEDOUT:
				return -EC_TTL_EXPIRED;
			case EPROTOTYPE:
			case EPROTONOSUPPORT:
			case EAFNOSUPPORT:
				return -EC_ADDRESSTYPE_NOT_SUPPORTED;
			case ECONNREFUSED:
				return -EC_CONN_REFUSED;
			case ENETDOWN:
			case ENETUNREACH:
				return -EC_NET_UNREACHABLE;
			case EHOSTUNREACH:
				return -EC_HOST_UNREACHABLE;
			case EBADF:
			default:
				return -EC_GENERAL_FAILURE;
		}

	}


	if (SOCKADDR_UNION_AF(&bind_addr) != AF_UNSPEC && bindtoip(fd, &bind_addr) == -1) {
		goto eval_errno;
	}

	if (connect(fd, remote->ai_addr, remote->ai_addrlen) == -1) {
		goto eval_errno;
	}


	freeaddrinfo(remote);

	return fd;

}

static void send_error (int fd, enum errorcode ec) {

	char buf[10] = {
		5,          // version
		ec,         // error
		0,          // reserved
		1,          // type
		0, 0, 0, 0, // ipv4
		0, 0        // port
	};

	write(fd, buf, 10);

}

static void main_loop (int fd1, int fd2) {

	int maxfd = fd2;
	if (fd1 > fd2) {
		maxfd = fd1;
	}

	fd_set fdsc, fds;
	FD_ZERO(&fdsc);
	FD_SET(fd1, &fdsc);
	FD_SET(fd2, &fdsc);

	while (1) {

		memcpy(&fds, &fdsc, sizeof(fds));
		struct timeval timeout = {.tv_sec = 60*15, .tv_usec = 0};

		switch (select(maxfd+1, &fds, 0, 0, &timeout)) {
			case 0:
				send_error(fd1, EC_TTL_EXPIRED);
				return;
			case -1:
				if (errno == EINTR) {
					continue;
				}
				return;
		}


		int infd = FD_ISSET(fd1, &fds) ? fd1 : fd2;
		int outfd = infd == fd2 ? fd1 : fd2;
		char buf[1024];
		ssize_t sent = 0;
		ssize_t n = read(infd, buf, sizeof buf);

		if (n <= 0) {
			return;
		}


		while (sent < n) {

			ssize_t m = write(outfd, buf + sent, n - sent);
			if (m < 0) {
				return;
			}

			sent += m;

		}

	}

}

static void* main_thread (void *data) {

	struct thread *t = data;
	t->state = SS_HANDSHAKE;

	unsigned char buf[1024];
	ssize_t n;
	int ret;
	int remotefd = -1;

	while ((n = recv(t->client.fd, buf, sizeof buf, 0)) > 0) {

		if (t->state == SS_HANDSHAKE) {

			unsigned char buf[2];
			buf[0] = 5;
			buf[1] = 0;
			write(t->client.fd, buf, 2);

			t->state = SS_CONNECT;

		} else if (t->state == SS_CONNECT) {

			ret = connect_socks_target(buf, n, &t->client);

			if (ret < 0) {
				send_error(t->client.fd, ret * -1);
				goto breakloop;
			}

			remotefd = ret;
			send_error(t->client.fd, EC_SUCCESS);
			main_loop(t->client.fd, remotefd);

			goto breakloop;

		}

	}


	breakloop:

	if (remotefd != -1) {
		close(remotefd);
	}

	close(t->client.fd);
	t->done = 1;

	return 0;

}

static void collect (sblist *threads) {

	size_t i;

	for (i = 0; i < sblist_getsize(threads);) {

		struct thread* thread = *((struct thread**)sblist_get(threads, i));
		if (thread->done) {
			pthread_join(thread->pt, 0);
			sblist_delete(threads, i);
			free(thread);
		} else {
			i++;
		}

	}

}

static int usage (void) {

	dprintf(2,
		"SOCKS Proxy\n"
		"\n"
		"Usage: socks-proxy -i ip -p port -b bindaddr\n"
		"\n"
		"       All arguments are optional.          \n"
		"       Default ip:   0.0.0.0                \n"
		"       Default port: 1080                   \n"
		"       Default bind: (unspecified)          \n"
	);

	return 1;

}



int main (int argc, char** argv) {

	int c;
	const char *listenip = "0.0.0.0";
	unsigned port = 1080;

	while ((c = getopt(argc, argv, ":b:i:p:")) != -1) {

		switch (c) {
			case 'b':
				resolve_sa(optarg, 0, &bind_addr);
				break;
			case 'i':
				listenip = optarg;
				break;
			case 'p':
				port = atoi(optarg);
				break;
			case ':':
				dprintf(2, "error: option -%c requires an operand\n", optopt);
			case '?':
				return usage();
		}

	}

	signal(SIGPIPE, SIG_IGN);
	struct server s;
	sblist *threads = sblist_new(sizeof (struct thread*), 8);
	if (proxy_setup(&s, listenip, port)) {
		return 1;
	}

	server = &s;
	size_t stacksz = MAX(8192, PTHREAD_STACK_MIN);

	while (1) {

		collect(threads);
		struct client c;
		struct thread *curr = malloc(sizeof (struct thread));

		if (!curr) {
			usleep(16);
			continue;
		}

		curr->done = 0;
		if (proxy_waitclient(&s, &c)) {
			continue;
		}

		curr->client = c;
		if (!sblist_add(threads, &curr)) {

			close(curr->client.fd);
			free(curr);

			usleep(16);
			continue;

		}

		pthread_attr_t *a = 0;
		pthread_attr_t attr;
		if (pthread_attr_init(&attr) == 0) {
			a = &attr;
			pthread_attr_setstacksize(a, stacksz);
		}

		pthread_create(&curr->pt, a, main_thread, curr);

		if (a) {
			pthread_attr_destroy(&attr);
		}

	}

}

