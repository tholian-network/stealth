# if you want to change/override some variables, do so in a file called
# config.mak, which is gets included automatically if it exists.

PROG = socks-proxy
SRCS = server.c proxy.c sblist.c
OBJS = $(SRCS:.c=.o)

LIBS = -lpthread

CFLAGS += -Wall -std=c99


all: $(PROG)

clean:
	rm -f $(PROG)
	rm -f $(OBJS)

%.o: %.c
	$(CC) $(CPPFLAGS) $(CFLAGS) $(INC) $(PIC) -c -o $@ $<

$(PROG): $(OBJS)
	$(CC) $(LDFLAGS) $(OBJS) $(LIBS) -o $@

.PHONY: all clean install

