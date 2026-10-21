# Timer 周期中断

`ecos/driver/timer_interrupt.h` 为已初始化的 Timer 注册周期回调。

- 头文件：`ecos/driver/timer_interrupt.h`
- 依赖：`ecos/driver/timer.h`
- 示例：`examples/peripherals/timer/interrupt`

## 函数

```c
typedef void (*ecos_timer_interrupt_handler_t)(void *arg);

ecos_err_t ecos_timer_register_callback(
    ecos_timer_id_t timer,
    ecos_timer_interrupt_handler_t callback,
    void *arg,
    uint32_t priority);

ecos_err_t ecos_timer_unregister_callback(ecos_timer_id_t timer);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_timer_register_callback()` | 注册周期回调，`priority` 为中断优先级 |
| `ecos_timer_unregister_callback()` | 注销回调 |

## 使用顺序

回调注册前必须先调用 `ecos_timer_init()`，并在使能全局中断后调用
`ecos_timer_start()`：

```c
#include "ecos/driver/interrupt.h"
#include "ecos/driver/timer.h"
#include "ecos/driver/timer_interrupt.h"

static volatile uint32_t ticks;

static void on_tick(void *arg)
{
    (void)arg;
    ++ticks;
}

void start_periodic_timer(void)
{
    const ecos_timer_config_t config = { 1000000u };  /* 1 s */

    ecos_timer_init(ECOS_TIMER_DEFAULT, &config);
    ecos_timer_register_callback(ECOS_TIMER_DEFAULT, on_tick, NULL, 1u);
    ecos_interrupt_global_enable();
    ecos_timer_start(ECOS_TIMER_DEFAULT);
}
```

## 注意事项

- 当前迁移实现覆盖 T1-Pico Timer0。
- 注册回调后，重新初始化、反初始化或使用同一 Timer 做轮询延时会返回
  `ECOS_ERR_BUSY`。
- 回调中只更新状态或计数；注销前应先停止 Timer。
- 通用中断控制器接口见 [Interrupt 中断控制器](interrupt.md)，普通轮询计时见
  [Timer 驱动](timer.md)。
