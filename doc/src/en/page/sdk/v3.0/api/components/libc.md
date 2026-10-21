# libc Subset

A subset of the C runtime library for bare-metal environments, providing memory, string, and formatted output support.

- Header: `stdio.h`, `string.h`, `assert.h`
- Component ID: part of the core runtime, included in the build by default

Output goes to the sys UART (console serial port) and does not pass through the file system.

## stdio.h

```c
int printf(const char *fmt, ...);
int puts(const char *str);
int vprintf(const char *fmt, va_list args);
int vsnprintf(char *str, size_t size, const char *fmt, va_list args);
int snprintf(char *buffer, size_t size, const char *format, ...);
```

| Function | Description |
| --- | --- |
| `printf()` / `vprintf()` | Formatted output to the console serial port |
| `puts()` | Output a string followed by a newline |
| `snprintf()` / `vsnprintf()` | Format into a buffer, writing at most `size` bytes (including the trailing NUL) |

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

!!! warning "`memcmp` Does Not Use the Standard Return Type"

    This implementation returns `size_t` (standard C uses `int`); for the comparison result, only test whether it is 0 and do not compare
    its sign.

## assert.h

```c
assert(expr, fmt, ...);
```

An assertion with a formatted message:

- Only takes effect under `CONFIG_BUILD_DEBUG`; on failure it prints via `ECOS_PANIC` and halts;
- In release builds it expands to `((void)0)`;
- Unlike the standard C `assert`, the `fmt` argument is mandatory.

## Usage Example

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

## Notes

- This is a libc **subset**: no file IO, floating-point formatting, or `malloc`; heap allocation is provided by
  the [heap component](heap.md).
- Output shares the system serial port with `printf`; text console semantics (CRLF) live in the BSP console layer.
- Floating-point formatting is unavailable; for fixed-point data such as sensor readings, split the integer and fractional parts yourself (see
  the [AHT20](../device/aht20.md) example).
