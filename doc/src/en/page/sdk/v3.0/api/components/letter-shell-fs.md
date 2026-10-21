# letter-shell-fs File System Commands

Registers file system commands such as `cd`, `ls`, and `touch` for Letter-Shell.

- Component ID: `letter-shell-fs`
- Header: `ecos/shell/fs.h`
- Dependencies: `letter-shell`, `fatfs`
- Example: `examples/storage/text-editor`

## Constants and Functions

```c
#define ECOS_SHELL_FS_PATH_CAPACITY 512u

int ecos_shell_fs_init(Shell *shell, char *path, size_t capacity);
int ecos_shell_fs_cd(int argc, char *argv[]);
int ecos_shell_fs_ls(int argc, char *argv[]);
int ecos_shell_fs_touch(int argc, char *argv[]);
```

| Function | Description |
| --- | --- |
| `ecos_shell_fs_init()` | Bind the path buffer before `shellInit()` |
| `ecos_shell_fs_cd()` | Change the FatFs current directory and update the prompt |
| `ecos_shell_fs_ls()` | List directory contents |
| `ecos_shell_fs_touch()` | Create an empty file; the contents of an existing file are not truncated |

## Usage Example

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

The command entry points must be registered by the application through its own Letter-Shell command table; for the registration method, refer to
the text-editor example.

## Notes

- `cd <directory>` updates the FatFs current directory and the Shell prompt; `ls [directory]` lists files
  one by one; `touch <filename>` creates a file that does not exist.
- This component is currently used only with a single active Shell and a single FatFs volume, and still requires real-board acceptance.
- `ShellFs` / `shellFsInit` are used internally by Letter-Shell; applications should access file system commands through the
  `ecos_shell_fs_*` interfaces on this page.
- A FatFs volume must be mounted before use; see [fatfs component](fatfs.md).
