# 错误、日志与标准骨架

所有公共 API 共用同一套错误码和日志接口；应用入口应先初始化 Console，再按需初始化其他资源。

## 错误模型

所有公共 API 使用 `ecos_err_t`（`int32_t`）作为统一返回值：

```c
#include "ecos/error.h"

typedef int32_t ecos_err_t;

enum {
    ECOS_OK = 0,
    ECOS_ERR_INVALID_ARGUMENT = -1,
    ECOS_ERR_UNSUPPORTED      = -2,
    ECOS_ERR_NOT_INITIALIZED  = -3,
    ECOS_ERR_IO               = -4,
    ECOS_ERR_TIMEOUT          = -5,
    ECOS_ERR_BUSY             = -6,
    ECOS_ERR_NO_MEMORY        = -7,
    ECOS_ERR_NOT_FOUND        = -8,
    ECOS_ERR_INVALID_STATE    = -9,
    ECOS_ERR_INTERNAL         = -10
};
```

返回值约定：

- **0**：成功；
- **正数**：成功且携带数据，例如读写字节数、`ecos_i2c_probe` 的 ACK 结果；
- **负数**：失败，取值为 `ECOS_ERR_*`。

常用辅助接口和宏：

| 名称 | 作用 |
| --- | --- |
| `ecos_result_succeeded()` / `ecos_result_failed()` | 按“非负成功、负数失败”判定结果 |
| `ecos_err_name()` / `ecos_err_description()` | 把错误码转换为可读字符串 |
| `ECOS_RETURN_ON_ERROR(expr)` | 失败时直接返回错误码 |
| `ECOS_GOTO_ON_ERROR(expr, err, label)` | 失败时记录错误并跳转清理 |
| `ECOS_PANIC_ON_ERROR(tag, expr, op)` | 失败时打印错误并停机 |

## 日志

```c
#include "ecos/log.h"

ECOS_LOGD(tag, ...);   /* DEBUG */
ECOS_LOGI(tag, ...);   /* INFO  */
ECOS_LOGW(tag, ...);   /* WARN  */
ECOS_LOGE(tag, ...);   /* ERROR */
ECOS_LOGF(tag, ...);   /* FATAL */
ECOS_LOG_ERR(tag, error, operation);
ECOS_PANIC(tag, ...);
```

- 默认日志输出到 BSP Console；`bsp_console_init()` 成功后自动接管。
- 默认输出 ASCII、CRLF，不启用 ANSI 颜色。
- 编译期门限为 `CONFIG_ECOS_LOG_LEVEL`（默认 INFO）。日志宏在门限以下会被编译为空，
  因此建议写成 `(void)ECOS_LOGI(...)`，以同时适应两种展开。
- 日志和 panic 默认不支持在中断处理函数中调用，除非自定义 writer 支持。
- 量产固件可通过 `ecos_panic_set_handler()` 注册停机前钩子（如进入安全态）。

## 标准应用骨架

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/timer.h"
#include "ecos/log.h"

#define LOG_TAG "app"

int main(void)
{
    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    (void)ECOS_LOGI(LOG_TAG, "application started");

    for (;;) {
        ECOS_PANIC_ON_ERROR(
            LOG_TAG,
            ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, 1000u),
            "delay"
        );
    }
}
```
