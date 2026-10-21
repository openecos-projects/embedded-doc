# Timer Periodic Interrupt

`ecos/driver/timer_interrupt.h` registers a periodic callback for an initialized Timer.

- Header: `ecos/driver/timer_interrupt.h`
- Dependencies: `ecos/driver/timer.h`
- Example: `examples/peripherals/timer/interrupt`

## Functions

```c
typedef void (*ecos_timer_interrupt_handler_t)(void *arg);

ecos_err_t ecos_timer_register_callback(
    ecos_timer_id_t timer,
    ecos_timer_interrupt_handler_t callback,
    void *arg,
    uint32_t priority);

ecos_err_t ecos_timer_unregister_callback(ecos_timer_id_t timer);
```

| Function | Description |
| --- | --- |
| `ecos_timer_register_callback()` | Register a periodic callback; `priority` is the interrupt priority |
| `ecos_timer_unregister_callback()` | Unregister the callback |

## Usage Order

You must call `ecos_timer_init()` before registering the callback, and call `ecos_timer_start()` after enabling
global interrupts:

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

## Notes

- The current migration implementation covers T1-Pico Timer0.
- After a callback is registered, re-initializing, deinitializing, or using the same Timer for polling delays
  returns `ECOS_ERR_BUSY`.
- In the callback, only update state or counters; stop the Timer before unregistering.
- For the general interrupt controller interface, see [Interrupt Controller](interrupt.md); for ordinary polling
  timing, see [Timer Driver](timer.md).
