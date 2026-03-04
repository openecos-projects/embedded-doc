# LIBC API

## 内存与基础字符串操作 (Memory & String Operations)

### 内存拷贝函数 (`memcpy`)

该函数用于从源内存地址连续复制指定字节长度的数据到目标地址，是对驱动层进行数据包封装、缓冲区迁移的基础工具。

```c title="string.h"
void *memcpy(void *dest, const void *src, size_t n);
```

!!! info "实现细节"
    ```c
    // 引用自 string.c
    char *d = (char *)dest;               // 目标指针转换为字节指针
    const char *s = (const char *)src;    // 源指针转换为字节指针
    
    while (n--) {
        *d++ = *s++;                      // 逐字节同步搬移
    }
    ```

    *   **字节级控制**：通过将 `void *` 指针强制转换为 `char *`，确保了拷贝操作是以字节为单位精确执行的，可以兼容任何内存结构。
    *   **线性地址偏移**：利用指针自增在单次循环中完成读取、赋值和指针移动，是保障大规模内存搬运效率的底层基础。

### 内存填充函数 (`memset`)

该函数可以将目标内存块的前 n 个字节设置为给定的常量值 c，主要用于系统变量初始化、缓冲区清零等。

```c title="string.h"
void *memset(void *s, int c, size_t n);
```

!!! info "实现细节"
    ```c
    // 引用自 string.c
    unsigned char *p = (unsigned char *)s;
    while (n--) {
        *p++ = (unsigned char)c;
    }
    ```

    *   **类型截断处理**：虽然 `c` 为 `int` 类型，但在填充时会强制转换为 `unsigned char`，确保每个内存单元填入的是 8 位物理数据。
    *   **确定性初始化**：防止由于 RAM 随机上电导致系统产生逻辑异常的情况。

### 字符串长度计算函数 (`strlen`)

该函数用于测量 C 语言风格字符串（以 `\0` 结尾）的有效字符总数，不包含结尾的结束符。

```c title="string.h"
size_t strlen(const char *s);
```

!!! info "实现细节"
    ```c
    // 引用自 string.c
    size_t len = 0;
    while (*s++) {
        len++;
    }
    ```

    *   **边界自动识别**：该函数不依赖预设长度信息，通过轮询内存直到探测到 `\0` 来确定字符串边界。
    *   **高效率遍历**：通过指针步进和计数器累加，实现了对未知长度文本流的快速定位。

## 格式化输出系统 (Standard I/O System)

### 格式化打印函数 (`printf`)

该函数用于提供系统级的格式化输出接口，支持变长参数传递，是系统开发中最直观的调试工具，负责将抽象数据转化为可读文本。

```c title="stdio.h"
int printf(const char *fmt, ...);
```

!!! info "实现细节"
    ```c
    // 引用自 stdio.c
    int printf(const char *fmt, ...) {
        va_list args;
        va_start(args, fmt);                 // 1. 初始化可变参数
        int ret = vprintf(fmt, args);        // 2. 调用核心解析引擎
        va_end(args);                        // 3. 清理环境
        return ret;
    }
    ```

    *   **变长参数机制**：利用 `stdarg.h` 提供的宏，函数能够自动计算栈空间偏移，从而获取在 `fmt` 之后传入的不定数量参数。
    *   **接口封装**：`printf` 并不直接负责解析逻辑，而是作为一层“薄封装”，将解析任务移交给 `vprintf`，这种设计使得输出逻辑与参数获取逻辑完全独立化。

### 核心格式解析引擎 (`vprintf`)

这是 Libc 的核心，负责扫描格式字符串，识别 `%` 引导的转换说明符，并实时调用底层驱动进行字符输出。

```c title="stdio.c"
int vprintf(const char *fmt, va_list args);
```

!!! info "实现细节"
    ```c
    // 引用自 stdio.c
    while (*fmt) {
        if (*fmt == '%' && *(fmt + 1)) {
            fmt++;
            switch (*fmt) {
                case 'd': // 处理十进制
                    int value = va_arg(args, int);
                    len = itoa_decimal(value, buffer);
                    count += puts_helper(buffer);
                    break;
                case 'x': // 处理十六进制
                    // ...
            }
        } else {
            sys_putchar(*fmt); // 普通字符直接输出
        }
    }
    ```

    *   **状态机解析机制**：通过 `while` 和 `switch` 结构实现了一个简易解析状态机，每当探测到 `%` 时，程序从直接输出模式切换到格式转换模式。
    *   **驱动层对接**：解析后的最终结果通过调用 `sys_putchar` 或 `puts_helper` 发送至串口，实现了从抽象格式到物理波形的转化。
    *   **扩展性设计**：目前的框架支持 `%d`, `%x`, `%s`, `%c` 以及长整数 `%llx`，通过在 `switch` 中增加分支，可以方便地扩展对浮点数或特定数据格式的支持。

### 整数转十进制字符串 (`itoa_decimal`)

将数值型的有符号整数转换为 ASCII 码构成的十进制字符串。

```c title="stdio.c"
int itoa_decimal(int value, char *buffer);
```

!!! info "实现细节"
    ```c
    // 引用自 stdio.c
    if (value < 0) {
        is_negative = 1;
        value = -value; // 处理负数
    }
    while (value > 0) {
        temp[i++] = '0' + (value % 10); // 取模获取每一位
        value /= 10;
    }
    ```

    *   **极性预处理操作**：函数优先判断数值正负，如果是负数则在缓冲区首位预留 `-` 号，这简化了后续的数学运算逻辑。
    *   **逆序取模运算**：由于通过 `%10` 得到的数字顺序是从低位到高位，代码先将结果存入临时缓冲区 `temp` 然后再进行反转，确保输出顺序符合我们阅读习惯。

### 整数转十六进制字符串 (`itoa_hex`)

将无符号整数转换为十六进制格式，常用于打印内存地址或寄存器数值。

```c title="stdio.c"
int itoa_hex(unsigned int value, char *buffer);
```

!!! info "实现细节"
    ```c
    // 引用自 stdio.c
    int digit = value % 16;
    temp[i++] = (digit < 10) ? ('0' + digit) : ('a' + digit - 10);
    value /= 16;
    ```
    
    *   **基数权重映射**：利用 `%16` 获取当前位的权重，并通过三目运算符处理 0-9 与 a-f 的 ASCII 码跳转。
    *   **无符号处理**：十六进制转换通常忽略符号位，直接处理原始二进制数据的位表示，这在调试底层寄存器时比调试十进制更加直观。
