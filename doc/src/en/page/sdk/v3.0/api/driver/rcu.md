# RCU Driver

Clock/reset control unit: configure the divider ratio and control bits, and read back the status register; on SoCs with a PLL, switch and query the frequency of each clock domain.

- Header: `ecos/driver/rcu.h`
- Examples: `examples/peripherals/rcu/status`, `examples/peripherals/rcu/pll`

## Types and Constants

```c
typedef enum {
    ECOS_RCU_ID_0 = 0,   /* the only instance */
    ECOS_RCU_ID_COUNT
} ecos_rcu_id_t;

#define ECOS_RCU_DEFAULT ((ecos_rcu_id_t)ECOS_RCU_ID_0)

typedef struct {
    uint32_t clock_divider;   /* divider ratio; hardware writes N-1 to RDIV */
    uint32_t control;         /* raw CTRL bits; bit definitions are SoC-defined */
} ecos_rcu_config_t;

#define ECOS_RCU_CONFIG_DEFAULT { 1u, 0u }

typedef enum {
    ECOS_RCU_PLL_SELECT_X1 = 0,   /* PLL reference multiplier x1 */
    ECOS_RCU_PLL_SELECT_X2 = 1
} ecos_rcu_pll_select_t;

typedef enum {
    ECOS_RCU_PLL_OD_1 = 0,   /* PLL output divider /1 */
    ECOS_RCU_PLL_OD_2 = 1,
    ECOS_RCU_PLL_OD_4 = 2,
    ECOS_RCU_PLL_OD_8 = 3
} ecos_rcu_pll_od_t;

typedef enum {
    ECOS_RCU_CLOCK_PLL = 0,
    ECOS_RCU_CLOCK_CPU,
    ECOS_RCU_CLOCK_AXI,
    ECOS_RCU_CLOCK_AHB,
    ECOS_RCU_CLOCK_APB
} ecos_rcu_clock_domain_t;

typedef struct {
    uint8_t n;                     /* PLL feedback divider ratio, >= 1 */
    ecos_rcu_pll_select_t select;
    ecos_rcu_pll_od_t od;
    uint8_t cpu_div;               /* per-domain divider bytes, written to CLK_DIV */
    uint8_t axi_div;
    uint8_t ahb_div;
    bool keep_apb;                 /* true = APB keeps its original clock */
    uint32_t settle_ticks;         /* PLL settle wait, 0 = default */
} ecos_rcu_pll_config_t;

/* combination verified on cl1-2512 */
#define ECOS_RCU_PLL_CONFIG_DEFAULT \
    { 40u, ECOS_RCU_PLL_SELECT_X1, ECOS_RCU_PLL_OD_2, 2u, 2u, 4u, true, 0u }
```

## Functions

```c
ecos_err_t ecos_rcu_init(ecos_rcu_id_t id, const ecos_rcu_config_t *config);
ecos_err_t ecos_rcu_deinit(ecos_rcu_id_t id);
ecos_err_t ecos_rcu_get_status(ecos_rcu_id_t id, uint32_t *status);
ecos_err_t ecos_rcu_pll_apply(ecos_rcu_id_t id,
                              const ecos_rcu_pll_config_t *config);
ecos_err_t ecos_rcu_pll_get_freq(ecos_rcu_id_t id,
                                 ecos_rcu_clock_domain_t domain,
                                 uint32_t *freq_hz);
```

| Function | Description |
| --- | --- |
| `ecos_rcu_init()` | Configure the divider ratio and CTRL control bits |
| `ecos_rcu_deinit()` | Clear the CTRL control bits |
| `ecos_rcu_get_status()` | Read back the STAT status register |
| `ecos_rcu_pll_apply()` | Validate the PLL parameters (Fvco must fall within 500-1200 MHz), then switch the CPU/AXI/AHB(/APB) clock domains following the hardware sequence |
| `ecos_rcu_pll_get_freq()` | Compute the frequency of the specified clock domain from register readback |

Frequencies of each domain for `ECOS_RCU_PLL_CONFIG_DEFAULT` on cl1-2512:

| Clock Domain | Frequency |
| --- | --- |
| Fvco | 800 MHz |
| PLL | 400 MHz |
| CPU / AXI | 200 MHz |
| AHB / SDRAM | 100 MHz |
| APB | 20 MHz (kept; UART unaffected) |

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/rcu.h"
#include "ecos/log.h"

#define LOG_TAG "rcu"

int main(void)
{
    const ecos_rcu_config_t config = ECOS_RCU_CONFIG_DEFAULT;
    uint32_t status;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_rcu_init(ECOS_RCU_DEFAULT, &config),
                        "initialize RCU");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_rcu_get_status(ECOS_RCU_DEFAULT, &status),
                        "read RCU status");
    (void)ECOS_LOGI(LOG_TAG, "RCU status: 0x%08X", status);
    for (;;) { }
}
```

## Notes

- **RCU affects the clock and reset domains**; misconfiguration may cause system anomalies. It is generally used only in hardware validation code; normal applications do not need to call it.
- The clock/reset domains controlled by the CTRL bits are SoC-defined and are not interpreted by the SDK.
- ysyx-2512-1 and ysyx-2512-2 provide the RDIV/CTRL interface, and the PLL interface returns `ECOS_ERR_UNSUPPORTED`; cl1-2512 (T1-Pico) provides the PLL interface, while `ecos_rcu_init()` / `ecos_rcu_deinit()` return `ECOS_ERR_UNSUPPORTED`.
- Do not mix with the 2.x legacy header `hal/rcu/hal_rcu.h`.
