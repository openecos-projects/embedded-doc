# Driver 驱动层

Driver 是稳定的外设公共接口，头文件位于 `ecos/driver/`：

| 模块 | 头文件 | 说明 |
| --- | --- | --- |
| GPIO | `ecos/driver/gpio.h` | 输入/输出、电平读写 |
| GPIO 中断 | `ecos/driver/gpio_interrupt.h` | 引脚外部中断 |
| UART | `ecos/driver/uart.h` | 通用异步串口 |
| I2C | `ecos/driver/i2c.h` | 主机收发与设备探测 |
| PWM | `ecos/driver/pwm.h` | 占空比与通道控制 |
| Timer | `ecos/driver/timer.h` | 延时与时基 |
| Timer 中断 | `ecos/driver/timer_interrupt.h` | 周期回调 |
| QSPI | `ecos/driver/qspi.h` | QSPI 主机 |
| PS/2 | `ecos/driver/ps2.h` | PS/2 设备输入 |
| WDG | `ecos/driver/wdg.h` | 看门狗 |
| RCU | `ecos/driver/rcu.h` | 复位与时钟控制 |
| RTC | `ecos/driver/rtc.h` | 实时时钟与闹钟 |
| RNG | `ecos/driver/rng.h` | 随机数 |
| CRC | `ecos/driver/crc.h` | CRC 计算 |
| ARCHINFO | `ecos/driver/archinfo.h` | 芯片标识与架构信息 |
| CLINT | `ecos/driver/clint.h` | 机器计时器（T1-Pico） |
| Interrupt | `ecos/driver/interrupt.h` | 中断控制器 |
| SDRAM | `ecos/driver/sdram.h` | SDRAM 初始化（T1-Pico） |

Driver 统一采用“配置结构体 + 默认值宏”的初始化方式：

```c
ecos_<x>_config_t          /* 实例配置：端口、时钟、周期、引脚等 */
ECOS_<X>_CONFIG_DEFAULT    /* 与配置结构体对应的默认初始化器 */
ECOS_<X>_DEFAULT           /* 总线型模块选择实例 0 */
```

外部器件封装见[Device 与 Component](device.md)。
