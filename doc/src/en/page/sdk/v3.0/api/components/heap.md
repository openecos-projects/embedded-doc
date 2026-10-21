# heap Memory Allocator

A dual-zone dynamic memory allocator that distinguishes on-chip SRAM from large external memory.

- Header: `ecos/heap.h`
- Component ID: part of the core runtime, included in the build by default

## Memory Zones

```c
typedef enum {
    ECOS_HEAP_ZONE_INTERNAL = 0,   /* On-chip SRAM pool */
    ECOS_HEAP_ZONE_EXTERNAL        /* External memory pool (e.g. SDRAM) */
} ecos_heap_zone_t;
```

- `ECOS_HEAP_ZONE_INTERNAL`: low latency and available right at startup; the default destination of `ecos_heap_malloc()`;
- `ECOS_HEAP_ZONE_EXTERNAL`: for explicitly requested large buffers (frame buffers, algorithm working sets).

## Functions

```c
ecos_err_t ecos_heap_add_pool(uintptr_t base, size_t size,
                              ecos_heap_zone_t zone);
void *ecos_heap_malloc(size_t size);
void *ecos_heap_alloc(ecos_heap_zone_t zone, size_t size);
void *ecos_heap_calloc(ecos_heap_zone_t zone, size_t count, size_t size);
void *ecos_heap_realloc(void *ptr, size_t size);
void ecos_heap_free(void *ptr);
size_t ecos_heap_free_bytes(ecos_heap_zone_t zone);
```

| Function | Description |
| --- | --- |
| `ecos_heap_add_pool()` | Register a memory pool with the specified zone; called by the Target startup code |
| `ecos_heap_malloc()` | Allocate from the INTERNAL zone |
| `ecos_heap_alloc()` | Allocate from the specified zone |
| `ecos_heap_calloc()` | Allocate and zero `count × size` |
| `ecos_heap_realloc()` | Resize an allocated block |
| `ecos_heap_free()` | Free memory |
| `ecos_heap_free_bytes()` | Return the total free bytes in the zone (including fragmentation) |

## Usage Example

```c
#include "ecos/heap.h"

void use_buffers(void)
{
    uint8_t *small = ecos_heap_malloc(256u);              /* INTERNAL */
    uint8_t *frame = ecos_heap_alloc(ECOS_HEAP_ZONE_EXTERNAL, 64u * 1024u);

    if (small != NULL) {
        /* use the on-chip buffer... */
        ecos_heap_free(small);
    }

    if (frame != NULL) {
        /* use the external frame buffer... */
        ecos_heap_free(frame);
    }
}
```

## Notes

- The memory pools are registered by the Target startup code before `main`; if none are registered, allocation returns `NULL`.
- The allocator is a K&R-style first-fit free list with 4-byte alignment; `free` merges adjacent free blocks.
- Single-threaded bare-metal model: the interfaces are lock-free; do not call them concurrently from interrupts and the main flow.
- `ecos_heap_free_bytes()` returns the total free amount, including fragmentation; the largest single allocatable block may be smaller.
- Currently only StarrySky T1-Pico registers pools at startup: INTERNAL = DSRAM heap area,
  EXTERNAL = 32 MiB SDRAM (the startup code also completes SDRAM controller initialization). On other Targets,
  allocation returns `NULL`.
- For the SDRAM initialization interface, see [SDRAM driver](../driver/sdram.md).
