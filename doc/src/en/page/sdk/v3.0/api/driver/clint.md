# CLINT Driver

RISC-V machine timer (CLINT): read `mtime` and access the compare value `mtimecmp`.

- Header: `ecos/driver/clint.h`
- The current migration implementation covers the CL1-2512 on StarrySky T1-Pico

## Types and Constants

```c
typedef struct {
    uint32_t low;    /* low 32 bits */
    uint32_t high;   /* high 32 bits */
} ecos_clint_value_t;
```

A 64-bit count value is represented by high and low words, avoiding reliance on 64-bit atomic accesses on 32-bit targets.

## Functions

```c
uint32_t ecos_clint_get_frequency_hz(void);
ecos_err_t ecos_clint_get_mtime(ecos_clint_value_t *value);
ecos_err_t ecos_clint_set_mtime(const ecos_clint_value_t *value);
ecos_err_t ecos_clint_get_mtimecmp(ecos_clint_value_t *value);
ecos_err_t ecos_clint_set_mtimecmp(const ecos_clint_value_t *value);
```

| Function | Description |
| --- | --- |
| `ecos_clint_get_frequency_hz()` | Return the counting frequency of `mtime` (Hz) |
| `ecos_clint_get_mtime()` / `set_mtime()` | Read/write the current count value |
| `ecos_clint_get_mtimecmp()` / `set_mtimecmp()` | Read/write the compare value; a machine timer interrupt is triggered when it is reached |

## Usage

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

## Notes

- This interface only returns count values; it does not expose the CLINT address or register layout to applications.
- Writes to `mtimecmp` are safely updated as high/low words by the Target HAL, avoiding spurious interrupts while the compare value is being updated.
- For millisecond-level delays or periodic events, prefer the [Timer Driver](timer.md) or [Timer Periodic Interrupt](timer_interrupt.md).
