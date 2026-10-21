# heap 堆内存

双区动态内存分配器，区分片上 SRAM 与外部大容量内存。

- 头文件：`ecos/heap.h`
- 组件 ID：核心运行时的一部分，默认进入构建

## 内存区域

```c
typedef enum {
    ECOS_HEAP_ZONE_INTERNAL = 0,   /* 片上 SRAM 池 */
    ECOS_HEAP_ZONE_EXTERNAL        /* 外部内存池（如 SDRAM） */
} ecos_heap_zone_t;
```

- `ECOS_HEAP_ZONE_INTERNAL`：延迟低、启动即可用，`ecos_heap_malloc()` 的默认去向；
- `ECOS_HEAP_ZONE_EXTERNAL`：用于显式申请的大缓冲（帧缓冲、算法工作集）。

## 函数

```c
ecos_err_t ecos_heap_add_pool(uintptr_t base, size_t size,
                              ecos_heap_zone_t zone);
void *ecos_heap_malloc(size_t size);
void *ecos_heap_alloc(ecos_heap_zone_t zone, size_t size);
void *ecos_heap_calloc(ecos_heap_zone_t zone, size_t count, size_t size);
void *ecos_heap_realloc(void *ptr, size_t size);
void ecos_heap_free(void *ptr);
size_t ecos_heap_free_bytes(ecos_heap_zone_t zone);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_heap_add_pool()` | 向指定 zone 注册内存池；由 Target 启动代码调用 |
| `ecos_heap_malloc()` | 从 INTERNAL 区分配 |
| `ecos_heap_alloc()` | 从指定 zone 分配 |
| `ecos_heap_calloc()` | 分配并清零 `count × size` |
| `ecos_heap_realloc()` | 调整已分配块大小 |
| `ecos_heap_free()` | 释放内存 |
| `ecos_heap_free_bytes()` | 返回该 zone 的空闲总量（含碎片） |

## 使用示例

```c
#include "ecos/heap.h"

void use_buffers(void)
{
    uint8_t *small = ecos_heap_malloc(256u);              /* INTERNAL */
    uint8_t *frame = ecos_heap_alloc(ECOS_HEAP_ZONE_EXTERNAL, 64u * 1024u);

    if (small != NULL) {
        /* 使用片上缓冲…… */
        ecos_heap_free(small);
    }

    if (frame != NULL) {
        /* 使用外部帧缓冲…… */
        ecos_heap_free(frame);
    }
}
```

## 注意事项

- 内存池由 Target 启动代码在 `main` 之前注册；未注册时分配返回 `NULL`。
- 分配器为 K&R 风格首次适配空闲链表，4 字节对齐，`free` 合并相邻空闲块。
- 单线程裸机模型：接口无锁，不要在中断与主流程中并发调用。
- `ecos_heap_free_bytes()` 返回空闲总量，包含碎片；单次最大可分配块可能更小。
- 目前只有 StarrySky T1-Pico 在启动时注册池：INTERNAL = DSRAM 堆区，
  EXTERNAL = 32 MiB SDRAM（启动代码同时完成 SDRAM 控制器初始化）。其他 Target 上
  分配返回 `NULL`。
- SDRAM 初始化接口见 [SDRAM 驱动](../driver/sdram.md)。
