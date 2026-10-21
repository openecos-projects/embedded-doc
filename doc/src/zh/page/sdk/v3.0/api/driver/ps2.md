# PS/2 驱动

PS/2 键盘输入：读取原始扫描码。

- 头文件：`ecos/driver/ps2.h`
- 示例：`examples/peripherals/ps2/keycodes`
- 当前只有 StarrySky L3.1 声明 PS2 能力

## 类型与常量

```c
typedef enum {
    ECOS_PS2_ID_0 = 0,   /* 唯一实例 */
    ECOS_PS2_ID_COUNT
} ecos_ps2_id_t;

#define ECOS_PS2_DEFAULT ((ecos_ps2_id_t)ECOS_PS2_ID_0)
```

## 函数

```c
ecos_err_t ecos_ps2_init(ecos_ps2_id_t id);
ecos_err_t ecos_ps2_deinit(ecos_ps2_id_t id);
ecos_err_t ecos_ps2_read(ecos_ps2_id_t id, uint32_t *scan_code);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_ps2_init()` | 将 L3.1 的 GPIO1[12:13] 切换到 PS2 复用功能并启用控制器 |
| `ecos_ps2_read()` | 读取原始寄存器值；0 表示当前没有键码 |
| `ecos_ps2_deinit()` | 关闭控制器 |

## 使用方式

```c
#include "ecos/driver/ps2.h"
#include "ecos/log.h"

#define LOG_TAG "ps2"

uint32_t code;

ecos_ps2_init(ECOS_PS2_DEFAULT);
for (;;) {
    if (ecos_ps2_read(ECOS_PS2_DEFAULT, &code) == ECOS_OK && code != 0u)
        (void)ECOS_LOGI(LOG_TAG, "scan code: 0x%02X", code);
}
```

`ecos_ps2_read()` 返回原始扫描码，不做键盘布局或按键状态解码；旧例程使用 `0x76`
作为 Escape 键码。

## 注意事项

- 调用者应轮询读取，并在结束时调用 `ecos_ps2_deinit()`。
- 驱动只负责硬件层；键码到字符的映射、按下/释放状态由应用维护。
