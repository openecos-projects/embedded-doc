# 应用开发

SDK 3.0 的应用代码只依赖公共头文件；Board 差异由 BSP、Target 和清单屏蔽。应用通常
按以下顺序使用接口：

1. 调用 `bsp_console_init()` 初始化控制台；
2. 按需初始化 Driver（GPIO、UART、I2C 等）；
3. 在 Driver 之上初始化 Device（传感器、EEPROM、屏幕等）；
4. 使用 Component（日志、错误处理、文件系统、Shell 等）。

## 接口分层

| 层 | 头文件 | 职责 | 参考 |
| --- | --- | --- | --- |
| Core | `ecos/error.h`、`ecos/log.h` | 错误码、日志、panic 和标准入口 | [错误、日志与标准骨架](core.md) |
| BSP | `ecos/bsp/*.h` | 板载 Console、LED、Button、Display 和板级资源 | [BSP 板级支持](bsp.md) |
| Driver | `ecos/driver/*.h` | SoC 外设的公共接口 | [Driver 驱动层](driver.md) |
| Device | `ecos/device/*.h` | 外部器件驱动 | [Device 驱动](device.md) |
| Component | `ecos/heap.h`、`ecos/soft_spi.h`、`ff.h` 等 | 堆、文件系统、Shell、协程等 | [Component 组件](components.md) |

## API 参考

### 核心与板级

| 页面 | 内容 |
| --- | --- |
| [错误、日志与标准骨架](core.md) | `ecos_err_t`、错误处理宏、日志级别、panic、标准 `main` 骨架 |
| [BSP 板级支持](bsp.md) | Console、LED、Button、BSP Display、`board_resources.h` |

### Driver

完整索引见 [Driver 驱动层](driver.md)，按类别分为：

| 类别 | 模块 |
| --- | --- |
| 外设与总线 | [GPIO](driver/gpio.md)、[GPIO 中断](driver/gpio_interrupt.md)、[UART](driver/uart.md)、[I2C](driver/i2c.md)、[PWM](driver/pwm.md)、[Timer](driver/timer.md)、[Timer 中断](driver/timer_interrupt.md)、[QSPI](driver/qspi.md)、[PS/2](driver/ps2.md) |
| 芯片服务 | [WDG](driver/wdg.md)、[RCU](driver/rcu.md)、[RTC](driver/rtc.md)、[RNG](driver/rng.md)、[CRC](driver/crc.md)、[ARCHINFO](driver/archinfo.md) |
| 中断与特殊外设 | [Interrupt](driver/interrupt.md)、[CLINT](driver/clint.md)、[SDRAM](driver/sdram.md) |

### Device 与 Component

| 页面 | 内容 |
| --- | --- |
| [Device 驱动](device.md) | AHT20、AT24C64、SGP30、PCF8563、Buzzer、ESP01S、ST7735、ST7789、TM1650 |
| [Component 组件](components.md) | libc、heap、LightCoroutine、sfud、FatFs、Letter-Shell、letter-shell-fs、soft-spi、text-editor、fcc |

## 从哪里开始

- 新应用先读[错误、日志与标准骨架](core.md)，从标准 `main` 骨架开始。
- 控制台、LED、按键、板载屏使用 [BSP 板级支持](bsp.md)。
- 串口、GPIO、I2C、QSPI、PWM、Timer 等使用 [Driver 驱动层](driver.md)。
- 传感器、EEPROM、RTC 芯片、SPI 屏等使用 [Device 驱动](device.md)。
- 堆、文件系统、Shell、协程等使用 [Component 组件](components.md)。
- 完整应用示例见[示例工程](../examples.md)。

## 约定

- 所有公共 API 返回 `ecos_err_t`：0 成功，正数成功并携带数据，负数失败。
- 只包含 `ecos/` 下的公共头文件；不要包含 HAL 内部头文件或直接访问 SoC 寄存器。
- 板级引脚通过 `ecos/board_resources.h` 的宏获取，不要按 Board 名称硬编码。
- Driver 与 Device 统一使用“配置结构体 + `ECOS_<X>_CONFIG_DEFAULT`”初始化。
- 总线型模块先初始化总线 Driver，再初始化挂接的 Device。
