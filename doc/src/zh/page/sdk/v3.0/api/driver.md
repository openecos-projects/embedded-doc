# Driver 驱动层

Driver 是稳定的外设公共接口，头文件位于 `ecos/driver/`。应用通过 Driver 访问
SoC 外设，不直接操作寄存器，也不包含 HAL 内部头文件。

## 模块索引

### 外设与总线

| 模块 | 头文件 | 说明 |
| --- | --- | --- |
| [GPIO](driver/gpio.md) | `ecos/driver/gpio.h` | 输入/输出、电平读写 |
| [GPIO 中断](driver/gpio_interrupt.md) | `ecos/driver/gpio_interrupt.h` | 引脚外部中断 |
| [UART](driver/uart.md) | `ecos/driver/uart.h` | 通用异步串口 |
| [I2C](driver/i2c.md) | `ecos/driver/i2c.h` | 主机收发与设备探测 |
| [PWM](driver/pwm.md) | `ecos/driver/pwm.h` | 占空比与通道控制 |
| [Timer](driver/timer.md) | `ecos/driver/timer.h` | 延时与时基 |
| [Timer 中断](driver/timer_interrupt.md) | `ecos/driver/timer_interrupt.h` | 周期回调 |
| [QSPI](driver/qspi.md) | `ecos/driver/qspi.h` | QSPI/SPI 主机 |
| [PS/2](driver/ps2.md) | `ecos/driver/ps2.h` | PS/2 设备输入 |

### 芯片服务

| 模块 | 头文件 | 说明 |
| --- | --- | --- |
| [WDG](driver/wdg.md) | `ecos/driver/wdg.h` | 看门狗 |
| [RCU](driver/rcu.md) | `ecos/driver/rcu.h` | 复位与时钟控制 |
| [RTC](driver/rtc.md) | `ecos/driver/rtc.h` | 实时计数器与闹钟 |
| [RNG](driver/rng.md) | `ecos/driver/rng.h` | 随机数 |
| [CRC](driver/crc.md) | `ecos/driver/crc.h` | CRC 计算 |
| [ARCHINFO](driver/archinfo.md) | `ecos/driver/archinfo.h` | 芯片标识与架构信息 |

### 中断与特殊外设

| 模块 | 头文件 | 说明 |
| --- | --- | --- |
| [Interrupt](driver/interrupt.md) | `ecos/driver/interrupt.h` | 中断控制器 |
| [CLINT](driver/clint.md) | `ecos/driver/clint.h` | 机器计时器（T1-Pico） |
| [SDRAM](driver/sdram.md) | `ecos/driver/sdram.h` | SDRAM 初始化（T1-Pico） |

## 初始化约定

Driver 统一采用“配置结构体 + 默认值宏”的初始化方式：

```c
ecos_<x>_config_t          /* 实例配置：端口、时钟、周期、引脚等 */
ECOS_<X>_CONFIG_DEFAULT    /* 与配置结构体对应的默认初始化器 */
ECOS_<X>_DEFAULT           /* 总线型模块选择实例 0 */
```

多数 Driver 提供 `ecos_<x>_get_instance_count()`、`ecos_<x>_init()` 和
`ecos_<x>_deinit()`；只读寄存器类模块（如 ARCHINFO）没有生命周期接口。所有返回
`ecos_err_t` 的接口遵循 [统一错误模型](core.md#error-model)。

外部器件封装见 [Device 驱动](device.md)，应用向组件见
[Component 组件](components.md)。

!!! note "Target 差异"

    并非所有 Target 都提供全部外设。模块页面的“注意事项”列出了各模块的可用
    Target；跨板代码应在初始化失败时处理 `ECOS_ERR_UNSUPPORTED`，而不是假设
    外设一定存在。
