# ARCHINFO Driver

Read the SoC's system identification word and chip ID (read-only register group).

- Header: `ecos/driver/archinfo.h`
- Example: `examples/peripherals/archinfo/chip-id`

## Types and Constants

```c
typedef enum {
    ECOS_ARCHINFO_ID_0 = 0,   /* the only instance */
    ECOS_ARCHINFO_ID_COUNT
} ecos_archinfo_id_t;

#define ECOS_ARCHINFO_DEFAULT ((ecos_archinfo_id_t)ECOS_ARCHINFO_ID_0)
```

## Functions

```c
ecos_err_t ecos_archinfo_get_system_id(ecos_archinfo_id_t id, uint32_t *value);
ecos_err_t ecos_archinfo_get_chip_id(ecos_archinfo_id_t id, uint64_t *value);
```

| Function | Description |
| --- | --- |
| `ecos_archinfo_get_system_id()` | Read the 32-bit system identification word (SYS register) |
| `ecos_archinfo_get_chip_id()` | Read the 64-bit chip ID (IDH:IDL concatenated) |

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/archinfo.h"
#include "ecos/log.h"

#define LOG_TAG "archinfo"

int main(void)
{
    uint32_t system_id;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_archinfo_get_system_id(ECOS_ARCHINFO_DEFAULT,
                                                    &system_id),
                        "read system id");
    (void)ECOS_LOGI(LOG_TAG, "system id: 0x%08X", system_id);
    for (;;) { }
}
```

## Notes

- The identification registers are read-only and have **no init/deinit lifecycle**; no initialization is required before calling.
- The specific encoding of the SYS/IDL/IDH fields is SoC-defined and is not interpreted by the SDK.
- ysyx-c2, ysyx-l3-1, ysyx-2512-1 and ysyx-2512-2 provide this IP; CL1-2512 (T1-Pico) does not.
- Do not mix with the 2.x legacy header `hal/archinfo/hal_archinfo.h`.
