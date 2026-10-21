# GPIO Driver

General-purpose digital IO pin control: direction, level, and pin function (alternate) configuration.

- Header: `ecos/driver/gpio.h`
- Example: `examples/peripherals/gpio/basic`

## Types and Constants

```c
typedef enum {
    ECOS_GPIO_PORT_0 = 0,
    ECOS_GPIO_PORT_1,
    ECOS_GPIO_PORT_2,
    ECOS_GPIO_PORT_3,
    ECOS_GPIO_PORT_COUNT
} ecos_gpio_port_t;                 /* GPIO port group; valid pin range is determined by the Target */

typedef enum {
    ECOS_GPIO_DIRECTION_INPUT = 0,  /* Input */
    ECOS_GPIO_DIRECTION_OUTPUT      /* Output */
} ecos_gpio_direction_t;

typedef enum {
    ECOS_GPIO_LEVEL_LOW = 0,        /* Low level */
    ECOS_GPIO_LEVEL_HIGH            /* High level */
} ecos_gpio_level_t;

typedef enum {
    ECOS_GPIO_FUNCTION_GPIO = 0,    /* Regular GPIO */
    ECOS_GPIO_FUNCTION_ALT_0,       /* Alternate function 0 */
    ECOS_GPIO_FUNCTION_ALT_1        /* Alternate function 1 */
} ecos_gpio_function_t;

typedef struct {
    ecos_gpio_port_t port;          /* Port group */
    uint8_t pin;                    /* Pin number within the group */
} ecos_gpio_pin_t;

typedef struct {
    ecos_gpio_direction_t direction; /* Direction */
    ecos_gpio_function_t function;   /* Pin function */
} ecos_gpio_config_t;

#define ECOS_GPIO_CONFIG_DEFAULT \
    { ECOS_GPIO_DIRECTION_INPUT, ECOS_GPIO_FUNCTION_GPIO }  /* Input + GPIO function */
```

`ecos_gpio_pin_t` can be initialized with the `ECOS_BOARD_GPIO_*` macros. Do not hard-code onboard pin numbers;
see [BSP board support](../bsp.md).

## Functions

```c
ecos_err_t ecos_gpio_configure(ecos_gpio_port_t port, uint8_t pin,
                               const ecos_gpio_config_t *config);
ecos_err_t ecos_gpio_set_direction(ecos_gpio_port_t port, uint8_t pin,
                                   ecos_gpio_direction_t direction);
ecos_err_t ecos_gpio_set_level(ecos_gpio_port_t port, uint8_t pin,
                               ecos_gpio_level_t level);
int ecos_gpio_get_level(ecos_gpio_port_t port, uint8_t pin);
ecos_err_t ecos_gpio_set_function(ecos_gpio_port_t port, uint8_t pin,
                                  ecos_gpio_function_t function);
```

| Function | Description |
| --- | --- |
| `ecos_gpio_configure()` | Configure direction and function in one call; the valid pin range is defined by the selected Target |
| `ecos_gpio_set_direction()` | Change the direction only |
| `ecos_gpio_set_function()` | Change the alternate function only |
| `ecos_gpio_set_level()` | Output a high/low level |
| `ecos_gpio_get_level()` | Return `ECOS_GPIO_LEVEL_LOW` (0) / `ECOS_GPIO_LEVEL_HIGH` (1); return a negative error code on failure |

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/gpio.h"
#include "ecos/log.h"

#define LOG_TAG "gpio"

int main(void)
{
    const ecos_gpio_config_t out_cfg = {
        .direction = ECOS_GPIO_DIRECTION_OUTPUT,
        .function = ECOS_GPIO_FUNCTION_GPIO,
    };
    int level;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_gpio_configure(ECOS_GPIO_PORT_1, 5u, &out_cfg),
                        "configure output pin");

    for (;;) {
        level = ecos_gpio_get_level(ECOS_GPIO_PORT_1, 7u);
        ECOS_PANIC_ON_ERROR(LOG_TAG, level, "read input pin");
        ECOS_PANIC_ON_ERROR(LOG_TAG,
                            ecos_gpio_set_level(ECOS_GPIO_PORT_1, 5u,
                                                (ecos_gpio_level_t)level),
                            "write output pin");
    }
}
```

## Notes

- GPIO has no `get_instance_count` or init/deinit: pins are configured as needed, with no global initialization.
- When porting code, prefer the `ecos_gpio_pin_t` initializer macros in `ecos/board_resources.h`
  to avoid hard-coding pin numbers.
- Bit-bang protocols (such as TM1650) are implemented directly on top of this module; for timing-sensitive
  cases, note that every `ecos_gpio_set_level()` call is a complete register write.
- For pin interrupts, see [GPIO External Interrupt](gpio_interrupt.md).
