# fatfs 文件系统

ChaN FatFs R0.16 文件系统，配合 sfud 在串行 Flash 上挂载 FAT 卷。

- 组件 ID：`fatfs`
- 头文件：`ff.h`，SDK 胶水：`ffinit.h`
- 依赖：Board 提供 `qspi` 和 `console` 能力
- 示例：`examples/storage/flash-fatfs`（只做非破坏性挂载探测）

!!! note "首发 release 范围"

    FatFs 当前被 `tools/sdk-manifest.json` 的 `release.exclude` 排除在首发发布包
    之外，需要在 development checkout 中使用。

## 标准 API（节选）

```c
FRESULT f_open(FIL *fp, const TCHAR *path, BYTE mode);
FRESULT f_close(FIL *fp);
FRESULT f_read(FIL *fp, void *buff, UINT btr, UINT *br);
FRESULT f_write(FIL *fp, const void *buff, UINT btw, UINT *bw);
FRESULT f_lseek(FIL *fp, FSIZE_t ofs);
FRESULT f_sync(FIL *fp);
FRESULT f_opendir(DIR *dp, const TCHAR *path);
FRESULT f_readdir(DIR *dp, FILINFO *fno);
FRESULT f_mkdir(const TCHAR *path);
FRESULT f_unlink(const TCHAR *path);
FRESULT f_rename(const TCHAR *path_old, const TCHAR *path_new);
FRESULT f_stat(const TCHAR *path, FILINFO *fno);
FRESULT f_mount(FATFS *fs, const TCHAR *path, BYTE opt);
FRESULT f_mkfs(const TCHAR *path, const MKFS_PARM *opt, void *work, UINT len);
FRESULT f_getfree(const TCHAR *path, DWORD *nclst, FATFS **fatfs);
```

核心类型：`FATFS`（卷对象）、`FIL`（文件对象）、`DIR`（目录对象）、`FILINFO`
（文件信息）、`FRESULT`（结果码）。完整语义见 FatFs 官方文档。

## SDK 胶水（ffinit.h）

```c
bool load_filesystem(void);        /* 只挂载已有卷，不改变 Flash 内容 */
FRESULT format_filesystem(void);   /* 显式格式化并挂载，会擦除卷 */
```

应用通常只需 `load_filesystem()`，成功后直接用 `f_open` 等标准 API。找不到文件
系统时不会自动格式化；需要初始化空 Flash 时，由应用显式调用
`format_filesystem()`，并先确认卷内数据已备份。

## 使用示例

```c
#include "ff.h"
#include "ffinit.h"

void write_file(void)
{
    FIL file;
    UINT written;

    if (!load_filesystem())
        return;

    if (f_open(&file, "demo.txt", FA_WRITE | FA_CREATE_ALWAYS) == FR_OK) {
        f_write(&file, "hello\n", 6u, &written);
        f_close(&file);
    }
}
```

## 注意事项

- FatFs 的 `FIL` 等对象较大，栈上分配时注意栈余量；建议放在静态区。
- 写文件后应调用 `f_close()` 或 `f_sync()`，否则掉电可能丢失数据。
- `format_filesystem()` 会擦除整个卷，只能在用户显式确认后调用。
- 挂载前需要底层 Flash 驱动可用；见 [sfud 组件](sfud.md)。
- Shell 文件系统命令见 [letter-shell-fs](letter-shell-fs.md)。
