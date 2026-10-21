# RNG Driver

Hardware random number generator: configure a seed, then read 32-bit random words.

- Header: `ecos/driver/rng.h`
- Example: `examples/peripherals/rng/random`

## Types and Constants

```c
typedef enum {
    ECOS_RNG_ID_0 = 0,   /* the only instance */
    ECOS_RNG_ID_COUNT
} ecos_rng_id_t;

#define ECOS_RNG_DEFAULT ((ecos_rng_id_t)ECOS_RNG_ID_0)

typedef struct {
    uint32_t seed;   /* random seed */
} ecos_rng_config_t;

#define ECOS_RNG_CONFIG_DEFAULT { 1u }
```

## Functions

```c
ecos_err_t ecos_rng_init(ecos_rng_id_t id, const ecos_rng_config_t *config);
ecos_err_t ecos_rng_deinit(ecos_rng_id_t id);
ecos_err_t ecos_rng_read(ecos_rng_id_t id, uint32_t *value);
```

| Function | Description |
| --- | --- |
| `ecos_rng_init()` | Write the seed and enable the generator |
| `ecos_rng_read()` | Read one 32-bit random word |
| `ecos_rng_deinit()` | Disable the generator |

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/rng.h"
#include "ecos/log.h"

#define LOG_TAG "rng"

int main(void)
{
    const ecos_rng_config_t config = ECOS_RNG_CONFIG_DEFAULT;
    uint32_t value;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_rng_init(ECOS_RNG_DEFAULT, &config),
                        "initialize RNG");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_rng_read(ECOS_RNG_DEFAULT, &value),
                        "read random word");
    (void)ECOS_LOGI(LOG_TAG, "random: 0x%08X", value);
    for (;;) { }
}
```

## Notes

- This hardware is a **seedable pseudo-random source**: the same seed produces the same sequence. Do not use it as a true random number generator (TRNG) for security scenarios.
- After seeding, it is recommended to give the hardware several cycles before reading the first value (the example uses `ecos_timer_delay_ms` to delay for 1 ms).
- ysyx-l3-1, ysyx-2512-1 and ysyx-2512-2 provide this IP; CL1-2512 (T1-Pico) does not.
- Do not mix with the 2.x legacy header `hal/rng/hal_rng.h`.
