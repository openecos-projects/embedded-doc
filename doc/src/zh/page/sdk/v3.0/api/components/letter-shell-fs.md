# letter-shell-fs 文件系统命令

为 Letter-Shell 注册 `cd`、`ls`、`touch` 等文件系统命令。

- 组件 ID：`letter-shell-fs`
- 头文件：`ecos/shell/fs.h`
- 依赖：`letter-shell`、`fatfs`
- 示例：`examples/storage/text-editor`

## 常量与函数

```c
#define ECOS_SHELL_FS_PATH_CAPACITY 512u

int ecos_shell_fs_init(Shell *shell, char *path, size_t capacity);
int ecos_shell_fs_cd(int argc, char *argv[]);
int ecos_shell_fs_ls(int argc, char *argv[]);
int ecos_shell_fs_touch(int argc, char *argv[]);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_shell_fs_init()` | 在 `shellInit()` 前绑定路径缓冲 |
| `ecos_shell_fs_cd()` | 切换 FatFs 当前目录并更新提示符 |
| `ecos_shell_fs_ls()` | 列出目录内容 |
| `ecos_shell_fs_touch()` | 创建空文件；已有文件内容不会被截断 |

## 使用示例

```c
#include "ecos/shell/fs.h"
#include "shell.h"

static Shell shell;
static char shell_buffer[256];
static char path[ECOS_SHELL_FS_PATH_CAPACITY];

void start_shell(void)
{
    memset(&shell, 0, sizeof(shell));
    shell.read = shellRead;
    shell.write = shellWrite;

    ecos_shell_fs_init(&shell, path, sizeof(path));
    shellInit(&shell, shell_buffer, sizeof(shell_buffer));
}
```

命令入口需要由应用通过自己的 Letter-Shell 命令表注册，注册方式参考 text-editor
示例。

## 注意事项

- `cd <directory>` 更新 FatFs 当前目录及 Shell 提示符；`ls [directory]` 逐项列出
  文件；`touch <filename>` 创建不存在的文件。
- 该组件目前只用于单一活动 Shell 和单一 FatFs 卷，仍需实板验收。
- `ShellFs` / `shellFsInit` 由 Letter-Shell 内部实现使用；应用应通过本页的
  `ecos_shell_fs_*` 接口访问文件系统命令。
- 使用前需挂载 FatFs 卷，见 [fatfs 组件](fatfs.md)。
