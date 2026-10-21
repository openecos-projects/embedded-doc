# Application Development

SDK 3.0 application code depends only on public headers; board differences are hidden by the BSP, Target, and manifest. Applications typically use the interfaces in the following order:

1. Call `bsp_console_init()` to initialize the console;
2. Initialize Drivers as needed (GPIO, UART, I2C, etc.);
3. Initialize Devices on top of Drivers (sensors, EEPROM, screens, etc.);
4. Use Components (logging, error handling, file system, Shell, etc.).

## API Layers

| Layer | Headers | Responsibility | Reference |
| --- | --- | --- | --- |
| Core | `ecos/error.h`, `ecos/log.h` | Error codes, logging, panic, and the standard entry point | [Errors, Logging and Standard Skeleton](core.md) |
| BSP | `ecos/bsp/*.h` | On-board Console, LED, Button, Display, and board-level resources | [BSP Board Support](bsp.md) |
| Driver | `ecos/driver/*.h` | Public interfaces for SoC peripherals | [Driver Layer](driver.md) |
| Device | `ecos/device/*.h` | External device drivers | [Device Drivers](device.md) |
| Component | `ecos/heap.h`, `ecos/soft_spi.h`, `ff.h`, etc. | Heap, file system, Shell, coroutines, etc. | [Components](components.md) |

## API Reference

### Core and Board Support

| Page | Contents |
| --- | --- |
| [Errors, Logging and Standard Skeleton](core.md) | `ecos_err_t`, error handling macros, log levels, panic, standard `main` skeleton |
| [BSP Board Support](bsp.md) | Console, LED, Button, BSP Display, `board_resources.h` |

### Driver

For the complete index, see [Driver Layer](driver.md); modules are grouped by category:

| Category | Modules |
| --- | --- |
| Peripherals and Buses | [GPIO](driver/gpio.md), [GPIO Interrupt](driver/gpio_interrupt.md), [UART](driver/uart.md), [I2C](driver/i2c.md), [PWM](driver/pwm.md), [Timer](driver/timer.md), [Timer Interrupt](driver/timer_interrupt.md), [QSPI](driver/qspi.md), [PS/2](driver/ps2.md) |
| Chip Services | [WDG](driver/wdg.md), [RCU](driver/rcu.md), [RTC](driver/rtc.md), [RNG](driver/rng.md), [CRC](driver/crc.md), [ARCHINFO](driver/archinfo.md) |
| Interrupts and Special Peripherals | [Interrupt](driver/interrupt.md), [CLINT](driver/clint.md), [SDRAM](driver/sdram.md) |

### Device and Components

| Page | Contents |
| --- | --- |
| [Device Drivers](device.md) | AHT20, AT24C64, SGP30, PCF8563, Buzzer, ESP01S, ST7735, ST7789, TM1650 |
| [Components](components.md) | libc, heap, LightCoroutine, sfud, FatFs, Letter-Shell, letter-shell-fs, soft-spi, text-editor, fcc |

## Where to Start

- New applications should first read [Errors, Logging and Standard Skeleton](core.md) and start from the standard `main` skeleton.
- For console, LED, buttons, and on-board displays, use [BSP Board Support](bsp.md).
- For UART, GPIO, I2C, QSPI, PWM, Timer, etc., use [Driver Layer](driver.md).
- For sensors, EEPROM, RTC chips, SPI displays, etc., use [Device Drivers](device.md).
- For heap, file system, Shell, coroutines, etc., use [Components](components.md).
- For complete application examples, see [Example Projects](../examples.md).

## Conventions

- All public APIs return `ecos_err_t`: 0 for success, a positive value for success carrying data, and a negative value for failure.
- Include only public headers under `ecos/`; do not include HAL internal headers or directly access SoC registers.
- Board pins are obtained through macros in `ecos/board_resources.h`; do not hard-code them by board name.
- Drivers and Devices uniformly use "configuration structure + `ECOS_<X>_CONFIG_DEFAULT`" initialization.
- For bus-based modules, initialize the bus Driver first, then the attached Device.
