# CRC Driver

Hardware CRC: after configuring the init value/xor value/mode, feed data as 32-bit words and read the result.

- Header: `ecos/driver/crc.h`
- Example: `examples/peripherals/crc/compute`

## Types and Constants

```c
typedef enum {
    ECOS_CRC_ID_0 = 0,   /* the only instance */
    ECOS_CRC_ID_COUNT
} ecos_crc_id_t;

#define ECOS_CRC_DEFAULT ((ecos_crc_id_t)ECOS_CRC_ID_0)

typedef struct {
    uint32_t init_value;   /* init value */
    uint32_t xor_out;      /* final XOR value */
    uint8_t mode;          /* mode 0-3; meaning is SoC-defined */
} ecos_crc_config_t;

#define ECOS_CRC_CONFIG_DEFAULT { 0xFFFFu, 0u, 2u }   /* combination verified on board */
```

## Functions

```c
ecos_err_t ecos_crc_init(ecos_crc_id_t id, const ecos_crc_config_t *config);
ecos_err_t ecos_crc_deinit(ecos_crc_id_t id);
ecos_err_t ecos_crc_feed(ecos_crc_id_t id, uint32_t word);
ecos_err_t ecos_crc_read(ecos_crc_id_t id, uint32_t *result);
ecos_err_t ecos_crc_compute(ecos_crc_id_t id, const uint32_t *words,
                            size_t count, uint32_t *result);
```

| Function | Description |
| --- | --- |
| `ecos_crc_init()` | Load the init value/xor value/mode and start a new round of computation |
| `ecos_crc_feed()` | Feed one 32-bit word |
| `ecos_crc_read()` | Read the current result |
| `ecos_crc_deinit()` | Disable the CRC unit |
| `ecos_crc_compute()` | Convenience interface: feed a word array in order, then read the result |

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/crc.h"
#include "ecos/log.h"

#define LOG_TAG "crc"

int main(void)
{
    const ecos_crc_config_t config = ECOS_CRC_CONFIG_DEFAULT;
    const uint32_t data[] = { 0x00123456u };
    uint32_t result;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_crc_init(ECOS_CRC_DEFAULT, &config),
                        "initialize CRC");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_crc_compute(ECOS_CRC_DEFAULT, data, 1u, &result),
                        "compute CRC");
    (void)ECOS_LOGI(LOG_TAG, "CRC: 0x%08X", result);
    for (;;) { }
}
```

## Notes

- `mode` corresponds to CTRL register bits[6:5]; the polynomial and width of each mode are SoC-defined. The default configuration is a combination verified on board; consult the datasheet before changing `mode`.
- Each round of computation starts with `ecos_crc_init()`; consecutive computations require re-initialization.
- ysyx-l3-1, ysyx-2512-1 and ysyx-2512-2 provide this IP; CL1-2512 (T1-Pico) does not.
- Do not mix with the 2.x legacy header `hal/crc/hal_crc.h`.
