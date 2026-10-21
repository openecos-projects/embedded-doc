# letter-shell 命令行

Letter-Shell 3.2.4 命令行交互组件，基于 BSP console 收发字符。

- 组件 ID：`letter-shell`
- 头文件：`shell.h`，一键启动：`shell_init.h`，移植钩子：`shell_port.h`
- 依赖：Board 提供 `console` 能力
- 示例：`examples/concurrency/letter-shell-smoke`

!!! note "首发 release 范围"

    Letter-Shell 当前被 `tools/sdk-manifest.json` 的 `release.exclude` 排除在首发
    发布包之外。串口交互、长时间输入、退格/历史/方向键和边界输入仍需实板验收。

## 核心 API（shell.h）

```c
void shellInit(Shell *shell, char *buffer, unsigned short size);
void shellTask(void *param);
void shellHandler(Shell *shell, char data);
void shellPrint(Shell *shell, const char *fmt, ...);
int shellRun(Shell *shell, const char *cmd);
```

| 函数 | 说明 |
| --- | --- |
| `shellInit()` | 绑定收发缓冲并初始化 Shell 对象 |
| `shellTask()` | 轮询任务体 |
| `shellHandler()` | 逐字节喂入输入 |
| `shellPrint()` | 向终端格式化输出 |
| `shellRun()` | 以字符串执行一条命令 |

`Shell` 对象应先清零，再设置 `read`/`write` 钩子，最后调用 `shellInit()`。有文件
系统路径时，可在初始化前用 `ecos_shell_fs_init()` 设置路径。

## 一键启动（shell_init.h）

```c
void load_shell(void);
```

初始化 shell 对象和缓冲并进入主循环，不返回。需要文件系统命令的应用应先挂载
FatFs 卷并初始化 [letter-shell-fs](letter-shell-fs.md)，再按 text-editor 示例注册
自己的命令表。

## 移植钩子（shell_port.h）

```c
short shellRead(char *str, unsigned short len);
short shellWrite(char *str, unsigned short len);
```

shell 的字节收发钩子，SDK 已对接系统串口。

## 命令注册

命令导出宏 `SHELL_EXPORT_CMD`（及 `_SIGN` / `_AGENCY` 变体）用于把函数注册为
shell 命令。

!!! warning "当前未启用 CMD_EXPORT"

    当前 `shell_cfg.h` 中 `SHELL_USING_CMD_EXPORT = 0`，导出宏展开为空，可用
    命令集合是编译内置的。需要自定义命令时，应在自己的命令表中注册，参考
    text-editor 示例。

- 默认用户 `StarrySky`，密码为空。
- 命令权限、参数数量等标志由 `SHELL_CMD_*` 宏组合，详见 `shell.h`。

## 使用示例

```c
#include "shell.h"
#include "shell_port.h"

static Shell shell;
static char shell_buffer[256];

void start_shell(void)
{
    memset(&shell, 0, sizeof(shell));
    shell.read = shellRead;
    shell.write = shellWrite;
    shellInit(&shell, shell_buffer, sizeof(shell_buffer));

    for (;;)
        shellTask(&shell);
}
```

## 注意事项

- Shell 使用 BSP console 的文本语义（CRLF、CR→LF 归一化），不直接访问 UART 寄存器。
- `shellTask()` 需要周期性调用；阻塞式 `load_shell()` 内部已经包含主循环。
- 单实例设计：同一时间只应有一个活动 Shell。
- 文件系统命令见 [letter-shell-fs](letter-shell-fs.md)，编辑器见
  [text-editor](text-editor.md)。
