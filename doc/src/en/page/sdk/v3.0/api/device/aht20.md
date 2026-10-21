# AHT20 Temperature and Humidity Sensor

An I2C temperature and humidity sensor; readings are returned as ×100 fixed-point numbers.

- Header: `ecos/device/aht20.h`
- Bus: I2C
- Example: `examples/peripherals/i2c/aht20`

## Types and Constants

```c
#define ECOS_AHT20_I2C_ADDRESS 0x38u   /* 7-bit I2C address */

typedef struct {
    ecos_i2c_id_t i2c;      /* attached I2C controller instance */
    uint8_t address;        /* device address */
} ecos_aht20_config_t;

typedef struct {
    ecos_aht20_config_t config;
    uint8_t initialized;
} ecos_aht20_t;

typedef struct {
    int32_t temperature_x100;   /* temperature in Celsius ×100 (fixed-point, may be negative) */
    uint32_t humidity_x100;     /* relative humidity % ×100 (fixed-point) */
} ecos_aht20_data_t;

#define ECOS_AHT20_CONFIG_DEFAULT { ECOS_I2C_DEFAULT, ECOS_AHT20_I2C_ADDRESS }
```

## Functions

```c
ecos_err_t ecos_aht20_init(ecos_aht20_t *sensor,
                           const ecos_aht20_config_t *config);
ecos_err_t ecos_aht20_deinit(ecos_aht20_t *sensor);
ecos_err_t ecos_aht20_read(ecos_aht20_t *sensor, ecos_aht20_data_t *data);
```

| Function | Description |
| --- | --- |
| `ecos_aht20_init()` | Initialize the handle; the I2C controller specified in config must be initialized first |
| `ecos_aht20_deinit()` | Deinitialize the handle |
| `ecos_aht20_read()` | Trigger one measurement and return the converted temperature and humidity |

## Usage Example

```c
#include "ecos/bsp/console.h"
#include "ecos/device/aht20.h"
#include "ecos/driver/i2c.h"
#include "ecos/log.h"

#define LOG_TAG "aht20"

int main(void)
{
    const ecos_i2c_config_t bus_config = ECOS_I2C_CONFIG_DEFAULT;
    const ecos_aht20_config_t dev_config = ECOS_AHT20_CONFIG_DEFAULT;
    ecos_aht20_t sensor;
    ecos_aht20_data_t data;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_i2c_init(ECOS_I2C_DEFAULT, &bus_config),
                        "initialize I2C");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_aht20_init(&sensor, &dev_config),
                        "initialize AHT20");

    ECOS_PANIC_ON_ERROR(LOG_TAG, ecos_aht20_read(&sensor, &data), "read sensor");
    (void)ECOS_LOGI(LOG_TAG, "temperature: %d.%02d C, humidity: %u.%02u %%",
                    data.temperature_x100 / 100,
                    data.temperature_x100 % 100,
                    data.humidity_x100 / 100u,
                    data.humidity_x100 % 100u);
    for (;;) { }
}
```

## Notes

- Readings are ×100 fixed-point numbers, avoiding floating-point formatting in bare-metal environments; split the integer and fractional parts yourself when printing (the example contains a reference implementation).
- `temperature_x100` may be negative; watch the sign and the modulo direction when printing.
- Initialize the same I2C controller only once; each I2C device calls its own `init`.
- For the generic I2C interface, see [I2C master driver](../driver/i2c.md).
