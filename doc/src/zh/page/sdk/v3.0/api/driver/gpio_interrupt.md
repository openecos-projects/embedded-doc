# GPIO 外部中断

`ecos/driver/gpio_interrupt.h` 在 GPIO 驱动之上提供边沿/电平触发和回调注册。

- 头文件：`ecos/driver/gpio_interrupt.h`
- 依赖：`ecos/driver/gpio.h`
- 示例：`examples/peripherals/gpio/interrupt`

## 类型与常量

```c
typedef enum {
    ECOS_GPIO_INTERRUPT_DISABLE = 0,   /* 关闭触发 */
    ECOS_GPIO_INTERRUPT_POSEDGE,       /* 上升沿 */
    ECOS_GPIO_INTERRUPT_NEGEDGE,       /* 下降沿 */
    ECOS_GPIO_INTERRUPT_ANYEDGE,       /* 双边沿 */
    ECOS_GPIO_INTERRUPT_LOW_LEVEL,     /* 低电平 */
    ECOS_GPIO_INTERRUPT_HIGH_LEVEL     /* 高电平 */
} ecos_gpio_interrupt_trigger_t;

typedef void (*ecos_gpio_interrupt_handler_t)(void *arg);
```

## 函数

```c
ecos_err_t ecos_gpio_interrupt_set_trigger(
    ecos_gpio_port_t port, uint8_t pin,
    ecos_gpio_interrupt_trigger_t trigger);

ecos_err_t ecos_gpio_interrupt_handler_add(
    ecos_gpio_port_t port, uint8_t pin,
    ecos_gpio_interrupt_handler_t handler,
    void *arg, uint32_t priority);

ecos_err_t ecos_gpio_interrupt_handler_remove(
    ecos_gpio_port_t port, uint8_t pin);

ecos_err_t ecos_gpio_interrupt_enable(ecos_gpio_port_t port, uint8_t pin);
ecos_err_t ecos_gpio_interrupt_disable(ecos_gpio_port_t port, uint8_t pin);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_gpio_interrupt_set_trigger()` | 设置触发类型；`DISABLE` 关闭触发 |
| `ecos_gpio_interrupt_handler_add()` | 注册回调及参数，`priority` 为中断优先级 |
| `ecos_gpio_interrupt_handler_remove()` | 注销回调 |
| `ecos_gpio_interrupt_enable()` / `_disable()` | 使能/关闭该引脚中断 |

## 使用顺序

先用 `ecos_gpio_configure()` 把引脚设为输入，再设置触发类型、注册回调并使能
中断：

```c
#include "ecos/board_resources.h"
#include "ecos/driver/gpio.h"
#include "ecos/driver/gpio_interrupt.h"

static volatile uint32_t irq_count;

static void handler(void *arg)
{
    (void)arg;
    ++irq_count;
}

void setup_button_irq(void)
{
    const ecos_gpio_pin_t input = ECOS_BOARD_GPIO_DEMO_INPUT;
    const ecos_gpio_config_t cfg = {
        .direction = ECOS_GPIO_DIRECTION_INPUT,
        .function = ECOS_GPIO_FUNCTION_GPIO,
    };

    ecos_gpio_configure(input.port, input.pin, &cfg);
    ecos_gpio_interrupt_set_trigger(input.port, input.pin,
                                    ECOS_GPIO_INTERRUPT_ANYEDGE);
    ecos_gpio_interrupt_handler_add(input.port, input.pin, handler, NULL, 1u);
    ecos_gpio_interrupt_enable(input.port, input.pin);
}
```

示例需要包含 `ecos/board_resources.h`，并在 Example 清单中要求 `gpio-demo` 资源。

## 注意事项

- 当前实现只把 T1-Pico GPIOA0..GPIOA7 映射到独立 PLIC source；其它 Board 会在
  配置阶段报告缺少 `gpio-interrupt` 能力。
- 回调应尽量短小，只更新状态或置标志位；日志、串口输出和复杂设备访问放到
  主循环。
- 中断回调中访问的共享变量应加 `volatile`，并在必要时用中断临界区保护。
- 机器中断控制器的通用接口见 [Interrupt 中断控制器](interrupt.md)。
