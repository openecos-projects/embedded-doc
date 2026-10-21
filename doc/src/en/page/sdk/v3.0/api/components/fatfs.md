# fatfs File System

The ChaN FatFs R0.16 file system; works with sfud to mount FAT volumes on serial Flash.

- Component ID: `fatfs`
- Header: `ff.h`; SDK glue: `ffinit.h`
- Dependencies: the Board provides the `qspi` and `console` capabilities
- Example: `examples/storage/flash-fatfs` (performs only a non-destructive mount probe)

!!! note "First Release Scope"

    FatFs is currently excluded from the first release package by `release.exclude` in
    `tools/sdk-manifest.json` and must be used from a development checkout.

## Standard API (Excerpt)

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

Core types: `FATFS` (volume object), `FIL` (file object), `DIR` (directory object), `FILINFO`
(file information), `FRESULT` (result code). For complete semantics, see the official FatFs documentation.

## SDK Glue (ffinit.h)

```c
bool load_filesystem(void);        /* Mount an existing volume only; does not change Flash contents */
FRESULT format_filesystem(void);   /* Explicitly format and mount; erases the volume */
```

Applications usually only need `load_filesystem()`; after it succeeds, use the standard APIs such as `f_open` directly. If no file
system is found, it will not format automatically; when empty Flash needs to be initialized, the application must explicitly call
`format_filesystem()`, and first confirm that the data in the volume has been backed up.

## Usage Example

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

## Notes

- Objects such as FatFs's `FIL` are large; watch the stack headroom when allocating them on the stack, and prefer static storage.
- After writing a file, call `f_close()` or `f_sync()`; otherwise a power loss may lose data.
- `format_filesystem()` erases the entire volume and must only be called after explicit user confirmation.
- The underlying Flash driver must be available before mounting; see [sfud component](sfud.md).
- For shell file system commands, see [letter-shell-fs](letter-shell-fs.md).
