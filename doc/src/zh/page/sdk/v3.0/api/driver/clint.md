# CLINT 驱动

RISC-V 机器计时器（CLINT）：读取 `mtime`、访问比较值 `mtimecmp`。

- 头文件：`ecos/driver/clint.h`
- 当前迁移实现覆盖 StarrySky T1-Pico 的 CL1-2512

## 类型与常量

```c
typedef struct {
    uint32_t low;    /* 低 32 位 */
    uint32_t high;   /* 高 32 位 */
} ecos_clint_value_t;
```

64 位计数值以高低两个字表示，避免在 32 位目标上依赖 64 位原子访问。

## 函数

```c
uint32_t ecos_clint_get_frequency_hz(void);
ecos_err_t ecos_clint_get_mtime(ecos_clint_value_t *value);
ecos_err_t ecos_clint_set_mtime(const ecos_clint_value_t *value);
ecos_err_t ecos_clint_get_mtimecmp(ecos_clint_value_t *value);
ecos_err_t ecos_clint_set_mtimecmp(const ecos_clint_value_t *value);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_clint_get_frequency_hz()` | 返回 `mtime` 的计数频率（Hz） |
| `ecos_clint_get_mtime()` / `set_mtime()` | 读写当前计数值 |
| `ecos_clint_get_mtimecmp()` / `set_mtimecmp()` | 读写比较值，到达时触发机器计时器中断 |

## 使用方式

```c
#include "ecos/driver/clint.h"

static void wait_ticks(uint32_t ticks)
{
    ecos_clint_value_t now;
    ecos_clint_value_t deadline;

    ecos_clint_get_mtime(&now);
    deadline.low = now.low + ticks;
    deadline.high = now.high + (deadline.low < now.low ? 1u : 0u);

    do {
        ecos_clint_get_mtime(&now);
    } while (now.high < deadline.high ||
             (now.high == deadline.high && now.low < deadline.low));
}
```

## 注意事项

- 该接口只返回计数值，不把 CLINT 地址或寄存器布局暴露给应用。
- `mtimecmp` 的写入由 Target HAL 负责按高低字安全更新，避免比较值在更新过程中
  产生伪中断。
- 需要毫秒级延时或周期事件时，优先使用 [Timer 驱动](timer.md) 或
  [Timer 周期中断](timer_interrupt.md)。
