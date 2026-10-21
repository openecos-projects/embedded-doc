# I2C Master Driver

7-bit address I2C master transmit/receive, supporting write-read combined transactions with a repeated START.

- Header: `ecos/driver/i2c.h`
- Example: `examples/peripherals/i2c/scan`

## Types and Constants

```c
typedef uint8_t ecos_i2c_id_t;              /* I2C controller instance number */

#define ECOS_I2C_DEFAULT ((ecos_i2c_id_t)0u) /* Default instance 0 */

typedef struct {
    uint32_t clock_divider;                  /* Clock divider */
} ecos_i2c_config_t;

#define ECOS_I2C_CONFIG_DEFAULT { 100u }
```

## Functions

```c
int ecos_i2c_get_instance_count(void);
ecos_err_t ecos_i2c_init(ecos_i2c_id_t i2c, const ecos_i2c_config_t *config);
ecos_err_t ecos_i2c_deinit(ecos_i2c_id_t i2c);
int ecos_i2c_probe(ecos_i2c_id_t i2c, uint8_t address);
ecos_err_t ecos_i2c_write(ecos_i2c_id_t i2c, uint8_t address,
                          const void *data, size_t size);
ecos_err_t ecos_i2c_read(ecos_i2c_id_t i2c, uint8_t address,
                         void *data, size_t size);
ecos_err_t ecos_i2c_write_read(ecos_i2c_id_t i2c, uint8_t address,
                               const void *write_data, size_t write_size,
                               void *read_data, size_t read_size);
```

| Function | Description |
| --- | --- |
| `ecos_i2c_get_instance_count()` | Return the number of I2C controllers provided by the current Target |
| `ecos_i2c_init()` / `ecos_i2c_deinit()` | Initialize/deinitialize a controller |
| `ecos_i2c_probe()` | Probe an address: return 1 on ACK, 0 on NACK, or a negative error code on failure |
| `ecos_i2c_write()` / `ecos_i2c_read()` | Issue a complete write/read transaction to a 7-bit slave address |
| `ecos_i2c_write_read()` | Write several bytes, issue a repeated START, then read several bytes |

`ecos_i2c_write_read()` is the standard approach for register-based devices: write the register address first,
then read the data.

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/i2c.h"
#include "ecos/log.h"

#define LOG_TAG "i2c"

int main(void)
{
    const ecos_i2c_config_t config = ECOS_I2C_CONFIG_DEFAULT;
    int count;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");

    count = ecos_i2c_get_instance_count();
    ECOS_PANIC_ON_ERROR(LOG_TAG, count, "query I2C controllers");
    if (count < 1)
        ECOS_PANIC_ON_ERROR(LOG_TAG, ECOS_ERR_NOT_FOUND, "find I2C controller");

    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_i2c_init(ECOS_I2C_DEFAULT, &config),
                        "initialize I2C");

    for (uint8_t addr = 0x08u; addr <= 0x77u; ++addr) {
        int ack = ecos_i2c_probe(ECOS_I2C_DEFAULT, addr);

        ECOS_PANIC_ON_ERROR(LOG_TAG, ack, "probe address");
        if (ack == 1)
            (void)ECOS_LOGI(LOG_TAG, "device at 0x%02X", addr);
    }

    ECOS_PANIC_ON_ERROR(LOG_TAG, ecos_i2c_deinit(ECOS_I2C_DEFAULT), "deinit");
    for (;;)
        __asm__ volatile("nop");
}
```

## Notes

- Addresses are always **7-bit** (excluding the read/write bit); do not scan reserved addresses outside 0x08–0x77.
- A `probe` result of 0 (NACK) is a normal result, not an error; only a negative number indicates a bus fault.
- Before attaching a device driver (AHT20, AT24C64, SGP30, PCF8563, etc.), you must first call
  `ecos_i2c_init()` on the same instance; see [Device drivers](../device.md).
- Do not mix with the 2.x legacy header `hal/i2c/hal_i2c.h`: its `hal_i2c_config_t` conflicts with the
  identically named type in the new contract `ecos/hal/i2c.h`.
