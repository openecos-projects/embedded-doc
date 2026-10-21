# Interrupt 中断控制器

PLIC source 的分配、优先级、使能和机器全局中断控制。

- 头文件：`ecos/driver/interrupt.h`
- 当前 3.0 迁移实现覆盖 T1-Pico

## 类型与常量

```c
typedef void (*ecos_interrupt_handler_t)(void *arg);
```

## 函数

```c
ecos_err_t ecos_interrupt_init(void);
ecos_err_t ecos_interrupt_alloc(uint32_t source, uint32_t priority,
                                ecos_interrupt_handler_t handler, void *arg);
ecos_err_t ecos_interrupt_free(uint32_t source);
ecos_err_t ecos_interrupt_enable(uint32_t source);
ecos_err_t ecos_interrupt_disable(uint32_t source);
void ecos_interrupt_set_threshold(uint32_t threshold);
void ecos_interrupt_global_enable(void);
void ecos_interrupt_global_disable(void);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_interrupt_init()` | 初始化中断控制器，通常由 BSP/Target 调用 |
| `ecos_interrupt_alloc()` | 为 PLIC source 注册回调及参数，`priority` 为抢占优先级 |
| `ecos_interrupt_free()` | 释放 source |
| `ecos_interrupt_enable()` / `_disable()` | 使能/关闭单个 source |
| `ecos_interrupt_set_threshold()` | 设置当前 hart 的优先级门限 |
| `ecos_interrupt_global_enable()` / `_disable()` | 开关机器全局中断 |

## 使用方式

```c
#include "ecos/driver/interrupt.h"

static volatile unsigned count;

static void handler(void *arg)
{
    (void)arg;
    ++count;
}

void setup_source(void)
{
    ecos_interrupt_init();
    ecos_interrupt_alloc(3u, 1u, handler, NULL);
    ecos_interrupt_enable(3u);
    ecos_interrupt_global_enable();
}
```

## 注意事项

- PLIC source 号和可用范围由 Target 决定，应用不应包含 SoC 头文件或直接读写 PLIC
  寄存器。
- 回调应只做短小、可重入的工作；串口输出和复杂设备访问应放到主循环。
- 外设专用中断接口见 [GPIO 外部中断](gpio_interrupt.md) 和
  [Timer 周期中断](timer_interrupt.md)。
