# Driver Layer

Drivers are the stable public peripheral interfaces, with headers located in `ecos/driver/`. Applications access SoC peripherals through Drivers, without directly manipulating registers or including HAL internal headers.

## Module Index

### Peripherals and Buses

| Module | Header | Description |
| --- | --- | --- |
| [GPIO](driver/gpio.md) | `ecos/driver/gpio.h` | Input/output, level read/write |
| [GPIO Interrupt](driver/gpio_interrupt.md) | `ecos/driver/gpio_interrupt.h` | Pin external interrupts |
| [UART](driver/uart.md) | `ecos/driver/uart.h` | General-purpose asynchronous serial port |
| [I2C](driver/i2c.md) | `ecos/driver/i2c.h` | Master transmit/receive and device probing |
| [PWM](driver/pwm.md) | `ecos/driver/pwm.h` | Duty cycle and channel control |
| [Timer](driver/timer.md) | `ecos/driver/timer.h` | Delay and time base |
| [Timer Interrupt](driver/timer_interrupt.md) | `ecos/driver/timer_interrupt.h` | Periodic callback |
| [QSPI](driver/qspi.md) | `ecos/driver/qspi.h` | QSPI/SPI master |
| [PS/2](driver/ps2.md) | `ecos/driver/ps2.h` | PS/2 device input |

### Chip Services

| Module | Header | Description |
| --- | --- | --- |
| [WDG](driver/wdg.md) | `ecos/driver/wdg.h` | Watchdog |
| [RCU](driver/rcu.md) | `ecos/driver/rcu.h` | Reset and clock control |
| [RTC](driver/rtc.md) | `ecos/driver/rtc.h` | Real-time counter and alarm |
| [RNG](driver/rng.md) | `ecos/driver/rng.h` | Random numbers |
| [CRC](driver/crc.md) | `ecos/driver/crc.h` | CRC calculation |
| [ARCHINFO](driver/archinfo.md) | `ecos/driver/archinfo.h` | Chip identification and architecture information |

### Interrupts and Special Peripherals

| Module | Header | Description |
| --- | --- | --- |
| [Interrupt](driver/interrupt.md) | `ecos/driver/interrupt.h` | Interrupt controller |
| [CLINT](driver/clint.md) | `ecos/driver/clint.h` | Machine timer (T1-Pico) |
| [SDRAM](driver/sdram.md) | `ecos/driver/sdram.h` | SDRAM initialization (T1-Pico) |

## Initialization Conventions

Drivers uniformly adopt "configuration structure + default value macro" initialization:

```c
ecos_<x>_config_t          /* instance configuration: port, clock, period, pins, etc. */
ECOS_<X>_CONFIG_DEFAULT    /* default initializer corresponding to the configuration structure */
ECOS_<X>_DEFAULT           /* bus-based modules select instance 0 */
```

Most Drivers provide `ecos_<x>_get_instance_count()`, `ecos_<x>_init()`, and `ecos_<x>_deinit()`; read-only register modules (such as ARCHINFO) have no lifecycle interface. All interfaces returning `ecos_err_t` follow the [unified error model](core.md#error-model).

For external device wrappers, see [Device Drivers](device.md); for application-facing components, see [Components](components.md).

!!! note "Target Differences"

    Not all Targets provide all peripherals. The "Notes" section of each module page lists the Targets available for that module; cross-board code should handle `ECOS_ERR_UNSUPPORTED` when initialization fails instead of assuming the peripheral always exists.
