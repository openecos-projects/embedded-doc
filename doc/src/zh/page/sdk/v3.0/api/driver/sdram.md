# SDRAM 驱动

板级 SDRAM 控制器初始化。

- 头文件：`ecos/driver/sdram.h`
- 示例：`examples/peripherals/sdram/init`
- 当前由 T1-Pico 提供

## 函数

```c
ecos_err_t ecos_sdram_init(void);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_sdram_init()` | 完成 SDRAM 控制器初始化；已初始化时不会重置正在使用的外部内存 |

初始化时序、刷新周期和模式寄存器访问属于 Target HAL 的实现细节。

## 使用方式

```c
#include "ecos/driver/sdram.h"
#include "ecos/heap.h"

void use_external_ram(void)
{
    void *buffer;

    (void)ecos_sdram_init();

    buffer = ecos_heap_alloc(ECOS_HEAP_ZONE_EXTERNAL, 4096u);
    if (buffer != NULL) {
        /* 使用外部内存…… */
        ecos_heap_free(buffer);
    }
}
```

外部内存池由 Target 启动代码注册，分配接口见
[heap 组件](../components/heap.md)。

## 注意事项

- T1-Pico 启动时已初始化 SDRAM，重复调用该接口不会重置正在使用的外部内存。
- `sdram-init` 示例从外部内存池分配 4 KiB 并校验读写；真实容量、长时间稳定性和
  断电启动仍需按人工验收清单验证。
- 只有注册了 `ECOS_HEAP_ZONE_EXTERNAL` 池的 Target 才能从外部内存分配，否则
  `ecos_heap_alloc()` 返回 `NULL`。
