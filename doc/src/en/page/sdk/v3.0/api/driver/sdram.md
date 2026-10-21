# SDRAM Driver

Board-level SDRAM controller initialization.

- Header: `ecos/driver/sdram.h`
- Example: `examples/peripherals/sdram/init`
- Currently provided by T1-Pico

## Functions

```c
ecos_err_t ecos_sdram_init(void);
```

| Function | Description |
| --- | --- |
| `ecos_sdram_init()` | Complete SDRAM controller initialization; does not reset external memory in use when already initialized |

Initialization timing, refresh period, and mode register access are implementation details of the Target HAL.

## Usage

```c
#include "ecos/driver/sdram.h"
#include "ecos/heap.h"

void use_external_ram(void)
{
    void *buffer;

    (void)ecos_sdram_init();

    buffer = ecos_heap_alloc(ECOS_HEAP_ZONE_EXTERNAL, 4096u);
    if (buffer != NULL) {
        /* Use external memory... */
        ecos_heap_free(buffer);
    }
}
```

The external memory pool is registered by the Target startup code; for the allocation interface, see the
[heap component](../components/heap.md).

## Notes

- T1-Pico has already initialized SDRAM at startup; calling this interface again does not reset external memory in use.
- The `sdram-init` example allocates 4 KiB from the external memory pool and verifies read/write; the actual capacity, long-term stability, and cold-boot behavior still need to be verified according to the manual acceptance checklist.
- Only Targets that have registered an `ECOS_HEAP_ZONE_EXTERNAL` pool can allocate from external memory; otherwise `ecos_heap_alloc()` returns `NULL`.
