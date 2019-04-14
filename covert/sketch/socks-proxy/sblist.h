#ifndef SBLIST_H
#define SBLIST_H


#ifdef __cplusplus
extern "C" {
#endif

#include <stddef.h>

typedef struct {
	size_t itemsize;
	size_t blockitems;
	size_t count;
	size_t capa;
	char* items;
} sblist;

#define sblist_getsize(X) ((X)->count)
#define sblist_get_count(X) ((X)->count)
#define sblist_empty(X) ((X)->count == 0)

sblist* sblist_new(size_t itemsize, size_t blockitems);
void sblist_free(sblist* l);
void sblist_init(sblist* l, size_t itemsize, size_t blockitems);
void sblist_free_items(sblist* l);
void* sblist_get(sblist* l, size_t item);
int sblist_add(sblist* l, void* item);
int sblist_set(sblist* l, void* item, size_t pos);
void sblist_delete(sblist* l, size_t item);
char* sblist_item_from_index(sblist* l, size_t idx);
int sblist_grow_if_needed(sblist* l);
int sblist_insert(sblist* l, void* item, size_t pos);
size_t sblist_addi(sblist* l, void* item);
void sblist_sort(sblist *l, int (*compar)(const void *, const void *));
size_t sblist_insert_sorted(sblist* l, void* o, int (*compar)(const void *, const void *));

#ifndef __COUNTER__
#define __COUNTER__ __LINE__
#endif

#define __sblist_concat_impl( x, y ) x##y
#define __sblist_macro_concat( x, y ) __sblist_concat_impl( x, y )
#define __sblist_iterator_name __sblist_macro_concat(sblist_iterator, __COUNTER__)

#define sblist_iter_counter(LIST, ITER, PTR) \
	for (size_t ITER = 0; (PTR = sblist_get(LIST, ITER)), ITER < sblist_getsize(LIST); ITER++)

#define sblist_iter_counter2(LIST, ITER, PTR) \
	for (ITER = 0; (PTR = sblist_get(LIST, ITER)), ITER < sblist_getsize(LIST); ITER++)

#define sblist_iter_counter2s(LIST, ITER, PTR) \
	for (ITER = 0; (PTR = sblist_get(LIST, ITER)), ITER < (ssize_t) sblist_getsize(LIST); ITER++)

#define sblist_iter(LIST, PTR) sblist_iter_counter(LIST, __sblist_iterator_name, PTR)

#ifdef __cplusplus
}
#endif

#endif

