# Letter Shell API 2.0

!!! info "文档说明"

    本文档介绍 SDK 2.0 版本中 Letter Shell 组件的命令行交互接口。该组件基于 Letter Shell 3.x 移植，当前 SDK 通过 `SYS_UART` 作为默认输入输出端口，并可在启用 FATFS 后提供 `ls`、`cd`、`touch` 等文件系统命令。开发者可通过 `load_shell` 快速启动交互式 Shell，也可直接使用 `shellInit`、`shellTask`、`shellRun` 等标准接口集成到自己的主循环中。


## 概述
### 版本特性

SDK 2.0 版本的 Letter Shell 组件提供串口命令行、命令解析、历史命令、Tab 补全、内置帮助、变量查看与修改、用户权限、按键映射、函数执行等能力。当前默认配置使用静态命令表，不使用 section 自动导出命令；默认用户为 `StarrySky`，无登录密码；输入输出端口绑定到 `hal_sys_getchar`、`hal_sys_putchar`。

当同时开启 `CONFIG_COMPONENT_FLASH_FS` 时，Shell 会先挂载 FATFS 文件系统，再注册文件系统伴生对象，提示符会显示当前目录，并启用 `ls`、`cd`、`touch` 文件命令。

### 适用范围

适用于 SDK 支持板卡上的串口调试、运行状态查看、变量在线修改、文件系统调试、简单命令控制、外设 bring-up、实验功能验证等场景。


## 头文件与依赖
### 核心头文件

```c title="main.c"
#include "shell_init.h"
#include "shell_port.h"
```

*   **shell.h**：Letter Shell 核心接口头文件，定义 `Shell`、`ShellCommand`、命令属性宏、命令表条目宏、`shellInit`、`shellTask`、`shellRun` 等标准接口。
*   **shell_cfg.h**：Shell 功能配置文件，用于配置命令导出、历史记录、格式化输出、默认用户、回车触发方式、未定义函数执行等特性。
*   **shell_init.h**：SDK 启动封装头文件，声明 `load_shell`，并包含 `hal_sys_uart.h`、`shell_fs.h`、`shell_port.h` 等依赖。
*   **shell_port.h**：SDK 端口层头文件，声明串口读写函数、演示变量初始化函数，以及 FATFS 文件命令适配函数。
*   **shell_fs.h**：Shell 文件系统扩展头文件，仅在 `CONFIG_COMPONENT_FLASH_FS` 开启时启用。

### 编译依赖

*   **CONFIG_COMPONENT_SHELL**：该宏用于在板卡构建配置中开启 Letter Shell 组件编译，不定义此宏时，`components/letter-shell/src` 不会被加入工程。
*   **SYS_UART 驱动**：当前端口层使用 `hal_sys_getchar`、`hal_sys_putchar`、`hal_sys_putstr` 作为 Shell 输入输出，需要在进入 Shell 前初始化系统串口。
*   **CONFIG_COMPONENT_FLASH_FS**：可选依赖。开启后 Shell 会启用 FATFS 文件系统命令，需要同时满足 FATFS、SFUD、软件 SPI 等依赖。
*   **日志与基础库组件**：端口层和文件命令使用 `printf`、`snprintf`、`strcpy`、`log_info`、`log_fatal` 等接口，工程需提供 libc、libgcc 和日志组件支持。

### 当前默认配置

```c title="shell_cfg.h"
#define SHELL_TASK_WHILE            1
#define SHELL_USING_CMD_EXPORT      0
#define SHELL_USING_COMPANION       0
#define SHELL_HELP_SHOW_PERMISSION  1
#define SHELL_ENTER_LF              1
#define SHELL_ENTER_CR              1
#define SHELL_ENTER_CRLF            0
#define SHELL_EXEC_UNDEF_FUNC       1
#define SHELL_PARAMETER_MAX_NUMBER  8
#define SHELL_HISTORY_MAX_NUMBER    5
#define SHELL_QUICK_HELP            1
#define SHELL_KEEP_RETURN_VALUE     0
#define SHELL_MAX_NUMBER            5
#define SHELL_PRINT_BUFFER          128
#define SHELL_SCAN_BUFFER           0
#define SHELL_GET_TICK()            0
#define SHELL_USING_LOCK            0
#define SHELL_SHOW_INFO             1
#define SHELL_CLS_WHEN_LOGIN        1
#define SHELL_DEFAULT_USER          "StarrySky"
#define SHELL_DEFAULT_USER_PASSWORD ""
#define SHELL_LOCK_TIMEOUT          0 * 60 * 1000
#define SHELL_USING_FUNC_SIGNATURE  0
#define SHELL_SUPPORT_ARRAY_PARAM   0
```

*   **SHELL_TASK_WHILE = 1**：`shellTask` 内部自带无限循环，适合直接作为阻塞式 Shell 任务使用。
*   **SHELL_USING_CMD_EXPORT = 0**：不使用 section 自动导出命令，当前命令来自 `shell_cmd_list.c` 中的 `shellCommandList` 静态表。
*   **SHELL_USING_COMPANION = 0**：默认不启用通用伴生对象链表；但 SDK 在开启 FATFS 时提供了文件系统伴生对象的简化实现。
*   **SHELL_ENTER_LF/SHELL_ENTER_CR = 1**：LF 与 CR 都可触发命令执行。
*   **SHELL_EXEC_UNDEF_FUNC = 1**：启用 `exec` 命令，可按地址执行函数，使用错误地址会导致系统异常。
*   **SHELL_PARAMETER_MAX_NUMBER = 8**：单条命令最多解析 8 个参数，包含命令名本身。
*   **SHELL_HISTORY_MAX_NUMBER = 5**：保存 5 条历史命令，可通过上下方向键切换。
*   **SHELL_PRINT_BUFFER = 128**：`shellPrint` 格式化输出缓冲区大小为 128 字节。
*   **SHELL_SCAN_BUFFER = 0**：未启用 `shellScan` 格式化输入。
*   **SHELL_GET_TICK() = 0**：未绑定系统 tick，双击 Tab 的时间判断和密码超时锁定不生效。
*   **SHELL_USING_LOCK = 0**：未启用 Shell 内部加锁，多任务访问需应用层处理互斥。
*   **SHELL_DEFAULT_USER_PASSWORD = ""**：默认用户无需密码，启动后直接进入可执行命令状态。


## 核心数据类型
### 命令类型

```c title="shell.h"
typedef enum {
    SHELL_TYPE_CMD_MAIN = 0,
    SHELL_TYPE_CMD_FUNC,
    SHELL_TYPE_VAR_INT,
    SHELL_TYPE_VAR_SHORT,
    SHELL_TYPE_VAR_CHAR,
    SHELL_TYPE_VAR_STRING,
    SHELL_TYPE_VAR_POINT,
    SHELL_TYPE_VAR_NODE,
    SHELL_TYPE_USER,
    SHELL_TYPE_KEY,
} ShellCommandType;
```

*   **SHELL_TYPE_CMD_MAIN**：main 形式命令，函数原型通常为 `int func(int argc, char *argv[])`。
*   **SHELL_TYPE_CMD_FUNC**：普通 C 函数形式命令，Shell 会按参数自动转换后调用。
*   **SHELL_TYPE_VAR_INT/SHORT/CHAR/STRING/POINT/NODE**：Shell 变量类型，可在命令行中查看或修改。
*   **SHELL_TYPE_USER**：Shell 用户定义，用于切换用户和权限控制。
*   **SHELL_TYPE_KEY**：按键定义，用于方向键、Tab、退格、回车等输入序列处理。

### Shell 对象

```c title="shell.h"
typedef struct shell_def {
    struct {
        const struct shell_command *user;
        int activeTime;
        char *path;
    } info;
    struct {
        unsigned short length;
        unsigned short cursor;
        char *buffer;
        char *param[SHELL_PARAMETER_MAX_NUMBER];
        unsigned short bufferSize;
        unsigned short paramCount;
        int keyValue;
    } parser;
    struct {
        void *base;
        unsigned short count;
    } commandList;
    struct {
        unsigned char isChecked : 1;
        unsigned char isActive : 1;
        unsigned char tabFlag : 1;
    } status;
    signed short (*read)(char *, unsigned short);
    signed short (*write)(char *, unsigned short);
} Shell;
```

*   **info.user**：当前用户对象。
*   **info.path**：当前 Shell 路径，开启 FATFS 后用于提示符路径显示。
*   **parser.buffer**：命令输入缓冲区。
*   **parser.param**：解析后的参数数组。
*   **commandList.base/count**：命令表基址和命令数量。
*   **status.isChecked**：当前用户是否已通过密码校验。
*   **status.isActive**：当前 Shell 是否处于命令执行状态，`shellGetCurrent` 依赖该标志查找当前 Shell。
*   **read/write**：底层输入输出回调，当前 SDK 绑定到 `shellRead` 和 `shellWrite`。

### 命令对象

```c title="shell.h"
typedef struct shell_command {
    union {
        struct {
            unsigned char permission : 8;
            ShellCommandType type : 4;
            unsigned char enableUnchecked : 1;
            unsigned char disableReturn : 1;
            unsigned char readOnly : 1;
            unsigned char reserve : 1;
            unsigned char paramNum : 4;
        } attrs;
        int value;
    } attr;
    union {
        struct {
            const char *name;
            int (*function)();
            const char *desc;
        } cmd;
        struct {
            const char *name;
            void *value;
            const char *desc;
        } var;
        struct {
            const char *name;
            const char *password;
            const char *desc;
        } user;
        struct {
            int value;
            void (*function)(Shell *);
            const char *desc;
        } key;
    } data;
} ShellCommand;
```

*   **attr.attrs.permission**：命令权限位，0 表示所有用户可执行。
*   **attr.attrs.type**：命令、变量、用户或按键类型。
*   **attr.attrs.enableUnchecked**：未通过密码校验时也允许执行。
*   **attr.attrs.disableReturn**：禁止打印命令返回值。
*   **attr.attrs.readOnly**：变量只读属性。
*   **data.cmd**：普通命令定义。
*   **data.var**：Shell 变量定义。
*   **data.user**：Shell 用户定义。
*   **data.key**：按键映射定义。

### 命令属性宏

```c title="shell.h"
#define SHELL_CMD_PERMISSION(permission) (permission & 0x000000FF)
#define SHELL_CMD_TYPE(type)             ((type & 0x0000000F) << 8)
#define SHELL_CMD_ENABLE_UNCHECKED       (1 << 12)
#define SHELL_CMD_DISABLE_RETURN         (1 << 13)
#define SHELL_CMD_READ_ONLY              (1 << 14)
#define SHELL_CMD_PARAM_NUM(num)         ((num & 0x0000000F) << 16)
```

*   **SHELL_CMD_PERMISSION**：设置命令权限。
*   **SHELL_CMD_TYPE**：设置命令类型。
*   **SHELL_CMD_ENABLE_UNCHECKED**：允许未登录或未校验密码时执行。
*   **SHELL_CMD_DISABLE_RETURN**：命令执行后不打印 `Return:`。
*   **SHELL_CMD_READ_ONLY**：变量只读。
*   **SHELL_CMD_PARAM_NUM**：限制命令参数数量。


## Shell 启动接口
### 创建演示环境变量

```c title="shell_port.h"
void create_shell_env_varible(void);
```

*   **功能**：初始化 SDK 默认导出的演示变量。
*   **当前变量**：
    * `envInt = 20260512`
    * `envShort = 2026`
    * `envString = "FINALx"`
    * `envChar = 'Y'`
    * `envFunc = easy_print` 函数地址
*   **调用说明**：如果需要在 Shell 中查看或修改这些默认变量，应在 `load_shell` 前调用。

### 启动默认 Shell

```c title="shell_init.h"
void load_shell(void);
```

*   **功能**：创建默认 Shell 对象，绑定串口读写函数，必要时初始化文件系统扩展，并进入 Shell 阻塞循环。
*   **调用说明**：
    * 进入 `load_shell` 前需要先调用 `hal_sys_uart_init()` 初始化系统串口。
    * `load_shell` 内部使用 1024 字节命令缓冲区和 1024 字节路径缓冲区。
    * 当前 `SHELL_TASK_WHILE = 1`，`shellTask` 自身不会返回，因此 `load_shell` 正常情况下不会返回。
    * 开启 `CONFIG_COMPONENT_FLASH_FS` 后，`load_shell` 会先调用 `load_filesystem()` 挂载文件系统，再初始化 `ShellFs` 并注册文件系统命令支持。

```c title="main.c"
#include "hal_sys_uart.h"
#include "shell_init.h"
#include "shell_port.h"

void main(void)
{
    create_shell_env_varible();
    hal_sys_uart_init();
    load_shell();

    while (1) {
    }
}
```


## Shell 标准接口（shell.h）
### 初始化与移除 Shell

```c title="shell.h"
void shellInit(Shell *shell, char *buffer, unsigned short size);
void shellRemove(Shell *shell);
#define shellDeInit(shell) shellRemove(shell)
```

*   **功能**：初始化或移除 Shell 对象。
*   **参数说明**：
    * `shell`：Shell 对象指针。
    * `buffer`：命令输入和历史记录共用缓冲区。
    * `size`：缓冲区总大小。
*   **调用说明**：
    * 当前 `SHELL_HISTORY_MAX_NUMBER = 5`，`shellInit` 会把 `buffer` 分成 6 份，其中 1 份作为当前命令输入缓冲，5 份作为历史记录。
    * 初始化前必须先设置 `shell->read` 和 `shell->write`。
    * 初始化后会自动加载命令表、设置默认用户并输出提示符。
    * `shell` 和 `buffer` 的生命周期必须覆盖 Shell 使用全过程。

### 写入输出

```c title="shell.h"
unsigned short shellWriteString(Shell *shell, const char *string);
void shellPrint(Shell *shell, const char *fmt, ...);
```

*   **功能**：向 Shell 输出字符串或格式化文本。
*   **返回值说明**：
    * `shellWriteString` 返回底层 `write` 实际写出的字符数。
    * `shellPrint` 无返回值，当前格式化缓冲区大小为 128 字节。
*   **调用说明**：`shellPrint` 只有在 `SHELL_PRINT_BUFFER > 0` 时有效。

### 输入处理与任务循环

```c title="shell.h"
void shellHandler(Shell *shell, char data);
void shellTask(void *param);
```

*   **功能**：处理单字节输入，或循环读取输入并交给 Shell 解析。
*   **参数说明**：
    * `shell`：Shell 对象指针。
    * `data`：串口接收到的单个字节。
    * `param`：传入 `Shell *`。
*   **调用说明**：
    * `shellHandler` 适合由中断、轮询或自定义输入循环逐字节喂入。
    * 当前 `SHELL_TASK_WHILE = 1`，`shellTask` 内部是无限循环。
    * `shellTask` 调用 `shell->read(&data, 1)` 获取输入，读到 1 字节后调用 `shellHandler`。

### 程序内执行命令

```c title="shell.h"
int shellRun(Shell *shell, const char *cmd);
```

*   **功能**：在程序内部直接执行一条 Shell 命令。
*   **参数说明**：
    * `shell`：已初始化的 Shell 对象。
    * `cmd`：待执行命令字符串。
*   **返回值**：0 表示命令已提交执行，-1 表示参数为空或命令长度超过输入缓冲区。
*   **调用说明**：
    * 该接口会把 `cmd` 复制到 Shell 输入缓冲区并调用内部命令执行流程。
    * 命令长度不能超过 `shell->parser.bufferSize - 1`。

### 获取当前 Shell

```c title="shell.h"
Shell *shellGetCurrent(void);
```

*   **功能**：获取当前处于命令执行状态的 Shell 对象。
*   **返回值**：找到活动 Shell 时返回 `Shell *`，否则返回 `NULL`。
*   **调用说明**：内置命令函数通常通过该接口获取当前 Shell，再调用 `shellWriteString` 输出结果。

### 路径设置

```c title="shell.h"
#define shellSetPath(_shell, _path) ((_shell)->info.path = _path)
#define shellGetPath(_shell)        ((_shell)->info.path)
```

*   **功能**：设置或获取 Shell 当前路径指针。
*   **调用说明**：开启 FATFS 后，提示符会显示 `shell->info.path`；未开启 FATFS 时提示符固定显示 `/`。


## 端口层接口（shell_port.h）
### 串口读写

```c title="shell_port.h"
short shellRead(char *str, unsigned short len);
short shellWrite(char *str, unsigned short len);
```

*   **功能**：为 Shell 提供底层输入输出。
*   **当前实现**：
    * `shellRead` 循环调用 `hal_sys_getchar()` 读取 `len` 个字符。
    * `shellWrite` 循环调用 `hal_sys_putchar()` 输出 `len` 个字符。
*   **调用说明**：
    * 这两个函数会在 `load_shell` 中绑定到 `shell.read` 和 `shell.write`。
    * 当前读接口是阻塞式读取，适合简单串口交互场景。

### 文件系统端口

```c title="shell_port.h"
size_t getcwd(char *dir, size_t dirLen);
size_t chdir(char *dir);
size_t listdir(char *dir, char *buffer, size_t maxLen);
size_t createfile(char *dir, char *filename);
```

*   **功能**：为 Shell 文件命令提供 FATFS 适配。
*   **启用条件**：仅在 `CONFIG_COMPONENT_FLASH_FS` 开启时编译。
*   **当前实现**：
    * `getcwd` 调用 `f_getcwd` 获取当前 FATFS 目录。
    * `chdir` 调用 `f_chdir` 切换目录。
    * `listdir` 调用 `f_opendir`、`f_readdir` 遍历目录，并把结果写入输出缓冲区。
    * `createfile` 调用 `f_open` 创建文件，成功后立即 `f_close`。
*   **路径规则**：端口层会把 Shell 路径拼接为 FATFS 路径，格式为 `0:<dir>` 或 `0:<dir><filename>`。


## 文件系统扩展（shell_fs.h）
### 文件系统对象

```c title="shell_fs.h"
typedef struct shell_fs {
    size_t (*getcwd)(char *, size_t);
    size_t (*chdir)(char *);
    size_t (*listdir)(char *dir, char *buffer, size_t maxLen);
    size_t (*createfile)(char *dir, char *filename);
    struct {
        char *path;
        size_t pathLen;
    } info;
} ShellFs;
```

*   **功能**：将文件系统操作函数与 Shell 当前路径绑定。
*   **调用说明**：
    * `load_shell` 会创建 `ShellFs shellfs`，设置端口函数，再调用 `shellFsInit`。
    * `shellCompanionAdd(&shell, SHELL_COMPANION_ID_FS, &shellfs)` 会把文件系统对象注册给 Shell 文件命令使用。

### 初始化文件系统扩展

```c title="shell_fs.h"
void shellFsInit(ShellFs *shellFs, char *pathBuffer, size_t pathLen);
```

*   **功能**：初始化 Shell 文件系统扩展，绑定路径缓冲区，并获取当前工作目录。
*   **参数说明**：
    * `shellFs`：文件系统扩展对象。
    * `pathBuffer`：路径缓冲区。
    * `pathLen`：路径缓冲区长度。

### 文件命令

```c title="shell_fs.h"
void shellCD(char *dir);
void shellLS(void);
void shellTOUCH(char *filename);
```

*   **shellCD**：切换当前目录，对应 Shell 命令 `cd`。
*   **shellLS**：列出当前目录内容，对应 Shell 命令 `ls`。
*   **shellTOUCH**：创建文件，对应 Shell 命令 `touch`。


## 内置命令与变量
### 基础命令

| 命令 | 功能 |
| --- | --- |
| `help` | 列出所有可见命令、变量、按键和用户 |
| `help <cmd>` | 查看指定命令帮助 |
| `cmds` | 列出所有命令 |
| `vars` | 列出所有变量 |
| `keys` | 列出所有按键映射 |
| `users` | 列出用户 |
| `clear` / `cls` | 清空控制台 |
| `setVar <name> <value>` | 修改 Shell 变量 |
| `sh <cmd>` | 直接运行一条 Shell 命令 |
| `reboot` | 预留重启命令，当前函数指针为 `NULL` |
| `exec <addr> [args...]` | 按地址执行函数，当前默认启用 |

### 文件系统命令

| 命令 | 启用条件 | 功能 |
| --- | --- | --- |
| `ls` | `CONFIG_COMPONENT_FLASH_FS` | 列出当前目录文件 |
| `cd <dir>` | `CONFIG_COMPONENT_FLASH_FS` | 切换当前目录 |
| `touch <file>` | `CONFIG_COMPONENT_FLASH_FS` | 创建一个新文件 |

### 默认变量

| 变量 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `envInt` | int | `20260512` | 演示整型变量 |
| `envShort` | short | `2026` | 演示短整型变量 |
| `envString` | string | `"FINALx"` | 演示字符串变量 |
| `envChar` | char | `'Y'` | 演示字符变量 |
| `envFunc` | int | `easy_print` 地址 | 演示函数地址变量 |

### 按键映射

| 按键 | 功能 |
| --- | --- |
| 上方向键 | 切换到上一条历史命令 |
| 下方向键 | 切换到下一条历史命令 |
| 左方向键 | 光标左移 |
| 右方向键 | 光标右移 |
| Tab | 命令补全或显示帮助 |
| Backspace/Delete | 删除字符 |
| LF/CR | 执行当前命令 |


## 新增命令
### 静态命令表方式

当前默认 `SHELL_USING_CMD_EXPORT = 0`，新增命令需要在 `components/letter-shell/src/shell_cmd_list.c` 的 `shellCommandList` 中增加条目。

```c title="shell_cmd_list.c"
static int led_on(void)
{
    /* 控制 LED */
    return 0;
}

const ShellCommand shellCommandList[] = {
    /* 保留已有命令项 */

    SHELL_CMD_ITEM(SHELL_CMD_PERMISSION(0) |
                   SHELL_CMD_TYPE(SHELL_TYPE_CMD_FUNC),
                   led_on,
                   led_on,
                   turn led on),

    /* 继续保留已有命令项 */
};
```

*   **命令名**：`SHELL_CMD_ITEM` 的第二个参数会被转成命令字符串。
*   **函数类型**：`SHELL_TYPE_CMD_FUNC` 适合普通函数；`SHELL_TYPE_CMD_MAIN` 适合 `int func(int argc, char *argv[])`。
*   **返回值**：如果未设置 `SHELL_CMD_DISABLE_RETURN`，命令执行后会输出 `Return: <dec>, 0x<hex>`。
*   **参数**：普通函数命令由 `shellExtRun` 自动解析参数，支持十进制、十六进制、二进制、八进制、字符和字符串等常见参数形式。

### 变量条目

```c title="shell_cmd_list.c"
static int debug_level;

const ShellCommand shellCommandList[] = {
    /* 保留已有命令项 */

    SHELL_VAR_ITEM(SHELL_CMD_PERMISSION(0) |
                   SHELL_CMD_TYPE(SHELL_TYPE_VAR_INT),
                   debug_level,
                   &debug_level,
                   debug level),

    /* 继续保留已有命令项 */
};
```

*   **查看变量**：在 Shell 中直接输入变量名。
*   **修改变量**：使用 `setVar debug_level 3`。
*   **只读变量**：可在属性中增加 `SHELL_CMD_READ_ONLY`。


## 使用示例
### 基础启动流程

```c title="main.c"
#include "hal_sys_uart.h"
#include "shell_init.h"
#include "shell_port.h"

void main(void)
{
    create_shell_env_varible();
    hal_sys_uart_init();
    load_shell();
}
```

### 手动创建 Shell

```c title="main.c"
#include "shell.h"
#include "shell_port.h"

static Shell shell;
static char shell_buffer[1024];
static char shell_path[128] = "/";

void shell_manual_start(void)
{
    shell.read = shellRead;
    shell.write = shellWrite;
    shellSetPath(&shell, shell_path);
    shellInit(&shell, shell_buffer, sizeof(shell_buffer));

    shellTask(&shell);
}
```

### 程序内执行命令

```c title="main.c"
void run_shell_command(void)
{
    Shell *shell = shellGetCurrent();

    if (shell != NULL) {
        shellRun(shell, "help");
    }
}
```

### 文件系统命令使用

```text title="Shell"
StarrySky:/$ ls
StarrySky:/$ touch test.txt
StarrySky:/$ ls
StarrySky:/$ cd /log
```


!!! info "硬件通用限制说明"

    *   当前端口层固定使用 `SYS_UART`，进入 Shell 前必须完成系统串口初始化。
    *   当前 `shellRead` 是阻塞式读取，`load_shell` 会长期占用当前执行流。
    *   当前默认未启用 Shell 内部锁，多任务同时读写同一 Shell 对象需要应用层加锁。
    *   当前 `SHELL_GET_TICK()` 固定返回 0，依赖时间的功能不可用。
    *   当前默认启用 `exec`，执行任意地址函数存在崩溃风险，量产固件建议关闭 `SHELL_EXEC_UNDEF_FUNC` 或限制命令权限。
    *   开启 FATFS 文件命令后，`load_shell` 会先挂载 Flash 文件系统；Flash 或 SPI 初始化失败会影响 Shell 文件命令。
    *   `reboot` 命令当前函数指针为 `NULL`，直接执行可能导致异常，使用前应绑定实际重启函数。


!!! info "通用使用规则"

    *   **标准流程**：`create_shell_env_varible` 初始化演示变量 → `hal_sys_uart_init` 初始化串口 → `load_shell` 进入交互。
    *   **手动流程**：准备 `Shell` 对象和缓冲区 → 绑定 `read/write` → `shellSetPath` → `shellInit` → `shellTask`。
    *   **命令扩展规则**：当前默认在 `shellCommandList` 中增加命令、变量、用户和按键条目。
    *   **缓冲区规则**：命令缓冲区会被历史记录切分，实际单条命令长度小于传入 `size`。
    *   **错误处理**：Shell 命令应检查参数合法性，避免在命令函数中直接访问非法地址或空指针。
