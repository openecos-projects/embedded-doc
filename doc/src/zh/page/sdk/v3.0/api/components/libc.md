# libc 子集

裸机环境下的 C 运行库子集，提供内存、字符串和格式化输出。

- 头文件：`stdio.h`、`string.h`、`assert.h`
- 组件 ID：核心运行时的一部分，默认进入构建

输出走 sys UART（控制台串口），不经文件系统。

## stdio.h

```c
int printf(const char *fmt, ...);
int puts(const char *str);
int vprintf(const char *fmt, va_list args);
int vsnprintf(char *str, size_t size, const char *fmt, va_list args);
int snprintf(char *buffer, size_t size, const char *format, ...);
```

| 函数 | 说明 |
| --- | --- |
| `printf()` / `vprintf()` | 格式化输出到控制台串口 |
| `puts()` | 输出字符串并换行 |
| `snprintf()` / `vsnprintf()` | 格式化到缓冲区，最多写 `size` 字节（含结尾 NUL） |

## string.h

```c
void *memcpy(void *dest, const void *src, size_t n);
void *memset(void *s, int c, size_t n);
size_t strlen(const char *s);
size_t memcmp(const void *ptr1, const void *ptr2, size_t num);
char *strchr(const char *str, int c);
int strcmp(const char *src, const char *dst);
char *strcpy(char *dst, const char *src);
char *strncpy(char *dst, const char *src, size_t len);
int strncmp(const char *s1, const char *s2, size_t n);
void *memmove(void *dest, const void *src, size_t num);
```

!!! warning "`memcmp` 不是标准返回类型"

    本实现返回 `size_t`（标准 C 为 `int`），比较结果请只判断是否为 0，不要比较
    正负。

## assert.h

```c
assert(expr, fmt, ...);
```

带格式化消息的断言：

- 仅在 `CONFIG_BUILD_DEBUG` 下生效，失败时经 `ECOS_PANIC` 打印并停机；
- 发布构建中展开为 `((void)0)`；
- 与标准 C 的 `assert` 不同，必须提供 `fmt` 参数。

## 使用示例

```c
#include "assert.h"
#include "stdio.h"
#include "string.h"

void report(const char *name, const void *data, size_t size)
{
    char buffer[64];

    assert(name != NULL, "name is NULL (%u bytes)", (unsigned)size);
    snprintf(buffer, sizeof(buffer), "%s: %u bytes", name, (unsigned)size);
    puts(buffer);

    if (memcmp(data, buffer, 0u) == 0u)
        printf("empty compare\n");
}
```

## 注意事项

- 这是 libc **子集**：没有文件 IO、浮点格式化、`malloc` 等；堆分配由
  [heap 组件](heap.md) 提供。
- 输出与 `printf` 共用系统串口；文本控制台语义（CRLF）在 BSP console 层。
- 浮点格式化不可用，传感器等定点数据请自行拆分整数/小数部分（见
  [AHT20](../device/aht20.md) 示例）。
