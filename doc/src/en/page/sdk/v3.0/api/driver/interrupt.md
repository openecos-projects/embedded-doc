# Interrupt Controller

PLIC source allocation, priority, enablement, and machine global interrupt control.

- Header: `ecos/driver/interrupt.h`
- The current 3.0 migration implementation covers T1-Pico

## Types and Constants

```c
typedef void (*ecos_interrupt_handler_t)(void *arg);
```

## Functions

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

| Function | Description |
| --- | --- |
| `ecos_interrupt_init()` | Initialize the interrupt controller; usually called by the BSP/Target |
| `ecos_interrupt_alloc()` | Register a callback and argument for a PLIC source; `priority` is the preemption priority |
| `ecos_interrupt_free()` | Free a source |
| `ecos_interrupt_enable()` / `_disable()` | Enable/disable a single source |
| `ecos_interrupt_set_threshold()` | Set the priority threshold of the current hart |
| `ecos_interrupt_global_enable()` / `_disable()` | Enable/disable machine global interrupts |

## Usage

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

## Notes

- PLIC source numbers and the available range are determined by the Target; applications should not include SoC headers or access PLIC registers directly.
- Callbacks should perform only short, reentrant work; serial output and complex device access should be left to the main loop.
- For peripheral-specific interrupt interfaces, see [GPIO External Interrupt](gpio_interrupt.md) and [Timer Periodic Interrupt](timer_interrupt.md).
