# Device Drivers

Device Drivers access external devices through public Drivers and do not directly depend on the pins of a specific board.

- Headers: `ecos/device/*.h`
- Examples: `examples/peripherals/i2c/*`, `examples/peripherals/pwm/buzzer`, `examples/peripherals/spi_master/*`

## Device Index

| Device | Header | Bus | Description |
| --- | --- | --- | --- |
| [AHT20](device/aht20.md) | `ecos/device/aht20.h` | I2C | Temperature/humidity sensor |
| [AT24C64](device/at24c64.md) | `ecos/device/at24c64.h` | I2C | 8 KB EEPROM |
| [SGP30](device/sgp30.md) | `ecos/device/sgp30.h` | I2C | Air quality sensor |
| [PCF8563](device/pcf8563.md) | `ecos/device/pcf8563.h` | I2C | RTC clock chip |
| [Buzzer](device/buzzer.md) | `ecos/device/buzzer.h` | PWM | Buzzer |
| [ESP01S](device/esp01s.md) | `ecos/device/esp01s_at.h` | UART | AT command Wi-Fi module |
| [ST7735](device/st7735.md) | `ecos/device/st7735.h` | QSPI | 128×128 TFT display |
| [ST7789](device/st7789.md) | `ecos/device/st7789.h` | QSPI | 240×240 TFT display |
| [TM1650](device/tm1650.md) | `ecos/device/tm1650.h` | GPIO | Four-digit seven-segment display |

## Common Pattern

All device drivers follow the same structure:

- **config structure** `ecos_<dev>_config_t`: specifies the attached bus instance and chip parameters (I2C address, PWM channel, QSPI chip select, GPIO pin, etc.);
- **default value macro** `ECOS_<DEV>_CONFIG_DEFAULT`: default initializer for common board wiring;
- **handle structure** `ecos_<dev>_t`: contains a copy of `config` and an `initialized` flag, held by the application and passed to every API;
- all functions return `ecos_err_t` (see [error model](core.md#error-model)).

The usage order is fixed: **the application first initializes the bus Driver** (e.g. `ecos_i2c_init`), **then calls `ecos_<dev>_init`**:

```c
const ecos_i2c_config_t bus_config = ECOS_I2C_CONFIG_DEFAULT;
const ecos_aht20_config_t dev_config = ECOS_AHT20_CONFIG_DEFAULT;
ecos_aht20_t sensor;

ECOS_PANIC_ON_ERROR(TAG, ecos_i2c_init(ECOS_I2C_DEFAULT, &bus_config), "i2c");
ECOS_PANIC_ON_ERROR(TAG, ecos_aht20_init(&sensor, &dev_config), "aht20");
```

## Grouped by Bus

### I2C Devices

Multiple devices on the same I2C bus share a single `ecos_i2c_init()`, and are then initialized individually:

- [AHT20 temperature/humidity sensor](device/aht20.md)
- [AT24C64 EEPROM](device/at24c64.md)
- [SGP30 air quality sensor](device/sgp30.md)
- [PCF8563 RTC](device/pcf8563.md)

### Displays and Indicators

- [ST7735 TFT](device/st7735.md) / [ST7789 TFT](device/st7789.md)
- [TM1650 seven-segment display](device/tm1650.md)
- [Buzzer](device/buzzer.md)

### Communication Modules

- [ESP01S Wi-Fi module](device/esp01s.md)

## Notes

- When all I2C devices share the bus, call `ecos_i2c_init` only once, and initialize each device driver separately with `ecos_<dev>_init`.
- Device handles (`ecos_<dev>_t`) are allocated by the application and may be placed in static storage; do not access the same handle concurrently in multiple tasks/interrupts (the SDK uses a single-threaded bare-metal model).
- Display and module drivers (ST7735/ST7789/ESP01S) internally initialize the buses/pins they depend on; avoid double initialization when sharing a controller instance with them.
- Internal headers kept for backward compatibility are not part of this page's API; new applications should use `ecos/device/*.h`.
- For application-facing components (heap, FatFs, Shell, soft-spi, etc.), see [Components](components.md).
