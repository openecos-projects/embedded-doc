# WDG 看门狗驱动

硬件看门狗：配置超时、喂狗与状态查询。

- 头文件：`ecos/driver/wdg.h`
- 示例：`examples/peripherals/wdg/reset`
- 当前只有 StarrySky L3.1 声明 WDG 能力

## 类型与常量

```c
typedef enum {
    ECOS_WDG_ID_0 = 0,   /* 唯一实例 */
    ECOS_WDG_ID_COUNT
} ecos_wdg_id_t;

#define ECOS_WDG_DEFAULT ((ecos_wdg_id_t)ECOS_WDG_ID_0)

typedef struct {
    uint32_t prescaler;   /* 分频值，必须非零 */
    uint32_t compare;     /* 比较值，必须非零 */
    uint32_t control;     /* SoC 原始控制字 */
} ecos_wdg_config_t;

#define ECOS_WDG_CONFIG_DEFAULT { 100u, 500u, 0x5u }
```

`prescaler` 和 `compare` 以实际分频/比较数表示，硬件寄存器写入值为参数减一，
因此两者都必须非零。`control` 是 SoC 原始控制字，默认 `0x5` 沿用旧复位例程。

## 函数

```c
ecos_err_t ecos_wdg_init(ecos_wdg_id_t id, const ecos_wdg_config_t *config);
ecos_err_t ecos_wdg_deinit(ecos_wdg_id_t id);
ecos_err_t ecos_wdg_feed(ecos_wdg_id_t id);
ecos_err_t ecos_wdg_get_status(ecos_wdg_id_t id, uint32_t *status);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_wdg_init()` | 解锁并配置看门狗，启动计数 |
| `ecos_wdg_deinit()` | 解锁并停用看门狗 |
| `ecos_wdg_feed()` | 喂狗，重装载计数 |
| `ecos_wdg_get_status()` | 读状态寄存器 |

## 最小使用骨架

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/wdg.h"
#include "ecos/log.h"

#define LOG_TAG "wdg"

int main(void)
{
    const ecos_wdg_config_t config = ECOS_WDG_CONFIG_DEFAULT;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_wdg_init(ECOS_WDG_DEFAULT, &config),
                        "initialize watchdog");

    for (;;) {
        ECOS_PANIC_ON_ERROR(LOG_TAG, ecos_wdg_feed(ECOS_WDG_DEFAULT), "feed");
        /* 周期性工作…… */
    }
}
```

## 注意事项

- 驱动在每次配置、喂狗和停用前写入旧工程的解锁密钥；喂狗按旧序列向 FEED 写入
  `1`，再写入 `0`。
- 复位例程会启动看门狗，运行时可能复位开发板；调试时注意先确认超时参数。
- 看门狗一旦启动，任何导致主循环长时间阻塞的操作都可能触发复位。
