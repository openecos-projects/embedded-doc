# SGP30 Air Quality Sensor

An I2C eCO2/TVOC sensor with baseline save and restore support.

- Header: `ecos/device/sgp30.h`
- Bus: I2C
- Example: `examples/peripherals/i2c/sgp30`

## Types and Constants

```c
#define ECOS_SGP30_I2C_ADDRESS 0x58u

typedef struct {
    ecos_i2c_id_t i2c;
    uint8_t address;
} ecos_sgp30_config_t;

typedef struct {
    ecos_sgp30_config_t config;
    uint8_t initialized;
} ecos_sgp30_t;

typedef struct {
    uint16_t co2_eq_ppm;   /* eCO2 concentration (ppm) */
    uint16_t tvoc_ppb;     /* TVOC concentration (ppb) */
} ecos_sgp30_air_quality_t;

typedef struct {
    uint16_t co2_eq_baseline;   /* eCO2 baseline */
    uint16_t tvoc_baseline;     /* TVOC baseline */
} ecos_sgp30_baseline_t;

#define ECOS_SGP30_CONFIG_DEFAULT { ECOS_I2C_DEFAULT, ECOS_SGP30_I2C_ADDRESS }
```

## Functions

```c
ecos_err_t ecos_sgp30_init(ecos_sgp30_t *sensor,
                           const ecos_sgp30_config_t *config);
ecos_err_t ecos_sgp30_deinit(ecos_sgp30_t *sensor);
ecos_err_t ecos_sgp30_read_serial_id(ecos_sgp30_t *sensor, uint64_t *serial_id);
ecos_err_t ecos_sgp30_measure_air_quality(ecos_sgp30_t *sensor,
                                          ecos_sgp30_air_quality_t *air_quality);
ecos_err_t ecos_sgp30_get_baseline(ecos_sgp30_t *sensor,
                                   ecos_sgp30_baseline_t *baseline);
ecos_err_t ecos_sgp30_set_baseline(ecos_sgp30_t *sensor,
                                   const ecos_sgp30_baseline_t *baseline);
```

| Function | Description |
| --- | --- |
| `ecos_sgp30_init()` | Probe the device and start IAQ measurement |
| `ecos_sgp30_deinit()` | Deinitialize the handle |
| `ecos_sgp30_read_serial_id()` | Read the 64-bit serial ID |
| `ecos_sgp30_measure_air_quality()` | Read eCO2 and TVOC once |
| `ecos_sgp30_get_baseline()` / `set_baseline()` | Read/restore the baseline, used to shorten the stabilization time after power-on again |

## Usage Example

```c
#include "ecos/device/sgp30.h"
#include "ecos/driver/i2c.h"
#include "ecos/driver/timer.h"
#include "ecos/log.h"

#define LOG_TAG "sgp30"

void measure(void)
{
    ecos_sgp30_t sensor;
    ecos_sgp30_air_quality_t air;
    const ecos_sgp30_config_t config = ECOS_SGP30_CONFIG_DEFAULT;

    ecos_i2c_init(ECOS_I2C_DEFAULT, &(const ecos_i2c_config_t)ECOS_I2C_CONFIG_DEFAULT);
    ecos_sgp30_init(&sensor, &config);

    for (;;) {
        if (ecos_sgp30_measure_air_quality(&sensor, &air) == ECOS_OK)
            (void)ECOS_LOGI(LOG_TAG, "eCO2: %u ppm, TVOC: %u ppb",
                            air.co2_eq_ppm, air.tvoc_ppb);
        ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, 1000u);
    }
}
```

## Notes

- `init` probes the device and starts IAQ measurement; **the first 15 seconds after the chip starts up return default values** (400 ppm / 0 ppb), which is normal.
- The baseline can be saved/restored across power loss to shorten the stabilization time on the next power-up; for how to save it to EEPROM or Flash, see [AT24C64](at24c64.md).
- A 1-second measurement period is recommended; reading more frequently will not speed up the sensor response.
- For the generic I2C interface, see [I2C master driver](../driver/i2c.md).
