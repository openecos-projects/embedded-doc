# GPIO External Interrupt

`ecos/driver/gpio_interrupt.h` provides edge/level triggering and callback registration on top of the GPIO driver.

- Header: `ecos/driver/gpio_interrupt.h`
- Dependencies: `ecos/driver/gpio.h`
- Example: `examples/peripherals/gpio/interrupt`

## Types and Constants

```c
typedef enum {
    ECOS_GPIO_INTERRUPT_DISABLE = 0,   /* Disable triggering */
    ECOS_GPIO_INTERRUPT_POSEDGE,       /* Rising edge */
    ECOS_GPIO_INTERRUPT_NEGEDGE,       /* Falling edge */
    ECOS_GPIO_INTERRUPT_ANYEDGE,       /* Both edges */
    ECOS_GPIO_INTERRUPT_LOW_LEVEL,     /* Low level */
    ECOS_GPIO_INTERRUPT_HIGH_LEVEL     /* High level */
} ecos_gpio_interrupt_trigger_t;

typedef void (*ecos_gpio_interrupt_handler_t)(void *arg);
```

## Functions

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

| Function | Description |
| --- | --- |
| `ecos_gpio_interrupt_set_trigger()` | Set the trigger type; `DISABLE` turns triggering off |
| `ecos_gpio_interrupt_handler_add()` | Register a callback and its argument; `priority` is the interrupt priority |
| `ecos_gpio_interrupt_handler_remove()` | Unregister the callback |
| `ecos_gpio_interrupt_enable()` / `_disable()` | Enable/disable the interrupt for this pin |

## Usage Order

First use `ecos_gpio_configure()` to set the pin as an input, then set the trigger type, register the callback,
and enable the interrupt:

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

The example must include `ecos/board_resources.h` and require the `gpio-demo` resource in the Example manifest.

## Notes

- The current implementation maps only T1-Pico GPIOA0..GPIOA7 to independent PLIC sources; other Boards report
  the missing `gpio-interrupt` capability during configuration.
- Callbacks should be as short as possible, only updating state or setting flags; put logging, serial output, and
  complex device accesses in the main loop.
- Shared variables accessed in an interrupt callback should be declared `volatile` and, when necessary, protected
  with an interrupt critical section.
- For the general interface to the machine interrupt controller, see [Interrupt Controller](interrupt.md).
