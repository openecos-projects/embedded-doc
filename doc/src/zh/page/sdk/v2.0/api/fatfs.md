# FATFS API 2.0

!!! info "文档说明"

    本文档介绍 SDK 2.0 版本中 FATFS 组件的文件系统接口。该组件基于 ChaN FatFs R0.16 移植，当前适配层将逻辑磁盘 `0:` 绑定到 SFUD 管理的片外 SPI NOR Flash，我们可通过标准 `f_open`、`f_read`、`f_write`、`f_mkfs` 等接口完成文件挂载、格式化、读写、目录遍历和空间查询。


## 概述
### 版本特性

SDK 2.0 版本的 FATFS 组件提供 FAT 文件系统访问能力，当前配置支持读写模式、长文件名、相对路径、目录操作、格式化、字符串读写等常用功能。底层磁盘 I/O 由 `diskio.c` 适配到 SFUD Flash，默认扇区大小固定为 4096 字节，逻辑扇区数量为 2048 个，对应 8MB Flash 文件系统空间。

组件同时提供 `load_filesystem` 封装接口，用于启动时自动挂载 `0:` 逻辑盘。当 Flash 中没有有效 FAT 文件系统时，该接口会自动调用 `f_mkfs` 创建新的 FAT 卷，再重新尝试挂载。

### 适用范围

适用于 SDK 支持板卡上的片外 Flash 文件存储场景，包括配置文件保存、日志文件读写、资源文件读取、小型数据集存储、Shell 文件命令后端、应用参数持久化等。


## 头文件与依赖
### 核心头文件

```c title="main.c"
#include "ff.h"
#include "ffinit.h"
```

*   **ff.h**：FatFs 标准应用接口头文件，定义 `FATFS`、`FIL`、`DIR`、`FILINFO`、`FRESULT`、`f_open`、`f_read`、`f_write` 等核心类型和函数。
*   **ffconf.h**：FatFs 编译配置文件，用于裁剪功能、设置扇区大小、长文件名、卷数量、时间戳、可重入性等。
*   **diskio.h**：底层磁盘 I/O 适配接口，定义 `disk_initialize`、`disk_read`、`disk_write`、`disk_ioctl` 等函数，通常由组件内部调用。
*   **ffinit.h**：SDK 提供的文件系统初始化封装头文件，声明 `load_filesystem`，并包含 SFUD、libgcc、stdio、string 等依赖。

### 编译依赖

*   **CONFIG_COMPONENT_FLASH_FS**：该宏用于在板卡构建配置中开启 FATFS 组件编译，不定义此宏时，`components/fatfs/src` 不会被加入工程。
*   **CONFIG_COMPONENT_SFUD**：当前 `diskio.c` 使用 SFUD 访问片外 SPI NOR Flash，必须同时开启 SFUD 组件。
*   **CONFIG_COMPONENT_SPI_SOFTWARE**：Kconfig 中 `CONFIG_COMPONENT_FLASH_FS` 依赖软件 SPI 与 SFUD；当前 SFUD 默认端口层也使用软件 SPI。
*   **日志与基础库组件**：`ff.h`、`ffinit.c` 和 `diskio.c` 使用 `log_debug`、`log_error`、`log_fatal`、`printf`、`bool` 等接口，工程需提供对应头文件和基础运行库支持。

### 当前默认配置

```c title="ffconf.h"
#define FF_FS_READONLY      0
#define FF_FS_MINIMIZE      0
#define FF_USE_MKFS         1
#define FF_USE_STRFUNC      1
#define FF_CODE_PAGE        950
#define FF_USE_LFN          1
#define FF_MAX_LFN          255
#define FF_LFN_UNICODE      0
#define FF_FS_RPATH         2
#define FF_VOLUMES          1
#define FF_MIN_SS           4096
#define FF_MAX_SS           4096
#define FF_FS_EXFAT         0
#define FF_FS_NORTC         1
#define FF_NORTC_YEAR       2026
#define FF_FS_REENTRANT     0
```

*   **FF_FS_READONLY = 0**：启用文件写入、删除、创建目录、同步、格式化等写操作。
*   **FF_FS_MINIMIZE = 0**：保留基础文件、目录、状态、空间查询等接口。
*   **FF_USE_MKFS = 1**：启用 `f_mkfs`，支持在 Flash 上创建 FAT 文件系统。
*   **FF_USE_STRFUNC = 1**：启用 `f_gets`、`f_putc`、`f_puts`、`f_printf`，不进行 LF 到 CRLF 的自动转换。
*   **FF_USE_LFN = 1**：启用长文件名，使用静态工作缓冲区，长文件名最大长度为 255。
*   **FF_LFN_UNICODE = 0**：API 路径字符串使用 ANSI/OEM 编码，`TCHAR` 等价于 `char`。
*   **FF_FS_RPATH = 2**：支持相对路径、切换当前目录、获取当前目录。
*   **FF_VOLUMES = 1**：仅启用一个逻辑卷，默认路径前缀为 `0:`。
*   **FF_MIN_SS/FF_MAX_SS = 4096**：扇区大小固定为 4096 字节，与当前 Flash 擦除块大小保持一致。
*   **FF_FS_EXFAT = 0**：不启用 exFAT，仅使用 FAT/FAT32 相关能力。
*   **FF_FS_NORTC = 1**：不读取 RTC，文件修改时间使用固定日期 `2026-01-01`。
*   **FF_FS_REENTRANT = 0**：未启用 FatFs 内部互斥，当前组件不保证同一卷多任务并发访问安全。


## 核心数据类型
### 返回值类型

```c title="ff.h"
typedef enum {
    FR_OK = 0,
    FR_DISK_ERR,
    FR_INT_ERR,
    FR_NOT_READY,
    FR_NO_FILE,
    FR_NO_PATH,
    FR_INVALID_NAME,
    FR_DENIED,
    FR_EXIST,
    FR_INVALID_OBJECT,
    FR_WRITE_PROTECTED,
    FR_INVALID_DRIVE,
    FR_NOT_ENABLED,
    FR_NO_FILESYSTEM,
    FR_MKFS_ABORTED,
    FR_TIMEOUT,
    FR_LOCKED,
    FR_NOT_ENOUGH_CORE,
    FR_TOO_MANY_OPEN_FILES,
    FR_INVALID_PARAMETER
} FRESULT;
```

*   **FR_OK**：操作成功。
*   **FR_DISK_ERR**：底层磁盘 I/O 读写失败，常见于 SFUD 访问 Flash 失败。
*   **FR_NOT_READY**：物理驱动未就绪，常见于 `disk_initialize` 或 Flash 初始化失败。
*   **FR_NO_FILE/FR_NO_PATH**：目标文件或路径不存在。
*   **FR_INVALID_NAME**：路径名格式非法。
*   **FR_DENIED/FR_EXIST**：访问被拒绝、目标已存在、目录满或打开模式不允许当前操作。
*   **FR_INVALID_OBJECT**：传入的 `FIL`、`DIR` 等对象无效，常见于未成功打开就读写。
*   **FR_NOT_ENABLED**：逻辑卷没有挂载工作区，通常需要先调用 `f_mount`。
*   **FR_NO_FILESYSTEM**：介质中没有有效 FAT 文件系统，可调用 `f_mkfs` 格式化。
*   **FR_MKFS_ABORTED**：格式化失败或参数不满足 FatFs 要求。
*   **FR_NOT_ENOUGH_CORE**：长文件名工作缓冲区不足或路径过深。
*   **FR_INVALID_PARAMETER**：参数非法。

### 文件系统对象

```c title="ff.h"
typedef struct {
    BYTE fs_type;
    BYTE pdrv;
    BYTE ldrv;
    BYTE n_fats;
    BYTE wflag;
    WORD id;
    WORD csize;
    DWORD n_fatent;
    DWORD fsize;
    LBA_t winsect;
    LBA_t volbase;
    LBA_t fatbase;
    LBA_t dirbase;
    LBA_t database;
    BYTE win[FF_MAX_SS];
} FATFS;
```

*   **功能**：保存一个逻辑卷的挂载状态、FAT 参数、缓存窗口和卷 ID。
*   **使用说明**：应用层需要为每个逻辑卷准备一个 `FATFS` 对象，并通过 `f_mount` 注册。当前 SDK 只启用 `FF_VOLUMES = 1`，通常只需要一个全局对象。

### 文件对象

```c title="ff.h"
typedef struct {
    FFOBJID obj;
    BYTE flag;
    BYTE err;
    FSIZE_t fptr;
    DWORD clust;
    LBA_t sect;
    BYTE buf[FF_MAX_SS];
} FIL;
```

*   **功能**：保存已打开文件的状态、文件指针、当前簇、当前扇区和文件私有缓存。
*   **使用说明**：每个打开的文件都需要独立的 `FIL` 对象。`FIL` 必须在 `f_open` 成功后才能传入 `f_read`、`f_write`、`f_lseek`、`f_close` 等接口。

### 目录与文件信息对象

```c title="ff.h"
typedef struct {
    FFOBJID obj;
    DWORD dptr;
    DWORD clust;
    LBA_t sect;
    BYTE *dir;
    BYTE fn[12];
} DIR;

typedef struct {
    FSIZE_t fsize;
    WORD fdate;
    WORD ftime;
    BYTE fattrib;
    TCHAR altname[FF_SFN_BUF + 1];
    TCHAR fname[FF_LFN_BUF + 1];
} FILINFO;
```

*   **DIR**：目录遍历对象，由 `f_opendir` 初始化，传入 `f_readdir` 逐项读取目录内容。
*   **FILINFO**：文件或目录信息对象，保存大小、日期、时间、属性、短文件名和长文件名。
*   **fattrib**：常用属性包括 `AM_DIR`（目录）、`AM_RDO`（只读）、`AM_HID`（隐藏）、`AM_SYS`（系统）、`AM_ARC`（归档）。

### 格式化参数

```c title="ff.h"
typedef struct {
    BYTE fmt;
    BYTE n_fat;
    UINT align;
    UINT n_root;
    DWORD au_size;
} MKFS_PARM;
```

*   **fmt**：文件系统类型，可使用 `FM_FAT`、`FM_FAT32`、`FM_ANY` 等。当前 `ffinit.c` 使用 `FM_FAT`。
*   **n_fat**：FAT 表数量，当前初始化封装使用 2。
*   **align**：数据区对齐扇区数，0 表示使用默认对齐。
*   **n_root**：FAT12/FAT16 根目录项数量，0 表示使用默认值。
*   **au_size**：簇大小，单位为字节。当前初始化封装设置为 4096，与扇区大小一致。

### 文件打开标志

```c title="ff.h"
#define FA_READ             0x01
#define FA_WRITE            0x02
#define FA_OPEN_EXISTING    0x00
#define FA_CREATE_NEW       0x04
#define FA_CREATE_ALWAYS    0x08
#define FA_OPEN_ALWAYS      0x10
#define FA_OPEN_APPEND      0x30
```

*   **FA_READ**：以读模式打开文件。
*   **FA_WRITE**：以写模式打开文件。
*   **FA_OPEN_EXISTING**：只打开已存在文件，文件不存在时返回 `FR_NO_FILE`。
*   **FA_CREATE_NEW**：创建新文件，文件已存在时返回 `FR_EXIST`。
*   **FA_CREATE_ALWAYS**：总是创建文件，已存在时清空原内容。
*   **FA_OPEN_ALWAYS**：文件存在则打开，不存在则创建。
*   **FA_OPEN_APPEND**：以追加方式打开文件，写指针移动到文件末尾。


## 文件系统初始化
### 自动挂载与格式化

```c title="ffinit.h"
bool load_filesystem(void);
```

*   **功能**：挂载 Flash 文件系统，必要时自动格式化并重新挂载。
*   **返回值**：`true` 表示挂载成功，`false` 表示挂载或格式化失败。
*   **调用说明**：
    * 系统启动后、调用文件读写接口前优先调用该函数。
    * 内部挂载路径固定为 `"0:"`。
    * 当 `f_mount(&fs_Flash, "0:", 1)` 返回 `FR_NO_FILESYSTEM` 时，内部会使用 4096 字节工作缓冲区调用 `f_mkfs` 创建 FAT 文件系统。
    * 内部最多进入 4 轮挂载流程，第 4 轮会打印超过最大重试次数日志；仍未挂载成功时返回 `false`。

```c title="ffinit.c"
FATFS fs_Flash;
FRESULT res_Flash;
uint8_t work_buf[4096] __attribute__((aligned(4)));
```

*   **fs_Flash**：组件内部默认使用的 Flash 文件系统对象。
*   **res_Flash**：组件内部保存的最近一次 FatFs 操作结果。
*   **work_buf**：格式化工作缓冲区，大小为一个 4096 字节扇区，并按 4 字节对齐。


## FatFs 标准接口（ff.h）
### 挂载与卸载逻辑卷

```c title="ff.h"
FRESULT f_mount(FATFS *fs, const TCHAR *path, BYTE opt);
#define f_unmount(path) f_mount(0, path, 0)
```

*   **功能**：注册或注销逻辑卷工作区。
*   **参数说明**：
    * `fs`：文件系统对象指针；传入 `NULL` 表示卸载。
    * `path`：逻辑卷路径，当前默认使用 `"0:"`。
    * `opt`：挂载选项，0 表示延迟挂载，1 表示立即挂载并检查介质。
*   **返回值**：`FR_OK` 表示挂载成功，`FR_NO_FILESYSTEM` 表示未找到有效 FAT 文件系统，其他值表示磁盘或参数错误。
*   **调用说明**：
    * 应用层可直接使用 `load_filesystem` 完成自动挂载。
    * 若自行调用 `f_mount`，首次挂载失败且返回 `FR_NO_FILESYSTEM` 时，可调用 `f_mkfs` 后重新挂载。

### 创建 FAT 文件系统

```c title="ff.h"
FRESULT f_mkfs(const TCHAR *path, const MKFS_PARM *opt, void *work, UINT len);
```

*   **功能**：在指定逻辑卷上创建 FAT 文件系统。
*   **参数说明**：
    * `path`：逻辑卷路径，当前默认使用 `"0:"`。
    * `opt`：格式化参数指针。
    * `work`：格式化工作缓冲区。
    * `len`：工作缓冲区大小，当前扇区大小为 4096，建议不小于 4096。
*   **返回值**：`FR_OK` 表示格式化成功，`FR_MKFS_ABORTED` 表示格式化中止，其他值表示磁盘或参数错误。
*   **调用说明**：
    * 格式化会清空原有文件系统数据。
    * 当前底层写入会通过 `sfud_erase_write` 擦写 Flash 扇区，执行时间与 Flash 速度有关。

### 打开与关闭文件

```c title="ff.h"
FRESULT f_open(FIL *fp, const TCHAR *path, BYTE mode);
FRESULT f_close(FIL *fp);
```

*   **功能**：打开、创建或关闭文件。
*   **参数说明**：
    * `fp`：文件对象指针。
    * `path`：文件路径，如 `"0:/config.txt"` 或相对路径 `"config.txt"`。
    * `mode`：打开模式，由 `FA_READ`、`FA_WRITE`、`FA_CREATE_ALWAYS` 等标志组合。
*   **返回值**：`FR_OK` 表示成功，`FR_NO_FILE` 表示文件不存在，`FR_DENIED` 表示访问被拒绝，其他值表示路径、对象或磁盘错误。
*   **调用说明**：
    * 写文件后必须调用 `f_close` 或 `f_sync`，确保缓存数据写回 Flash。
    * 当前 `FF_FS_LOCK = 0`，应用层需要避免删除、重命名正在打开的文件。

### 读取文件

```c title="ff.h"
FRESULT f_read(FIL *fp, void *buff, UINT btr, UINT *br);
```

*   **功能**：从已打开文件当前位置读取数据。
*   **参数说明**：
    * `fp`：已成功打开的文件对象。
    * `buff`：读缓冲区。
    * `btr`：期望读取字节数。
    * `br`：实际读取字节数输出指针。
*   **返回值**：`FR_OK` 表示接口执行成功；若 `*br < btr`，通常表示读到文件末尾。
*   **调用说明**：文件需以 `FA_READ` 模式打开。

### 写入文件

```c title="ff.h"
FRESULT f_write(FIL *fp, const void *buff, UINT btw, UINT *bw);
FRESULT f_sync(FIL *fp);
```

*   **功能**：向已打开文件当前位置写入数据，并可主动同步缓存。
*   **参数说明**：
    * `fp`：已成功打开的文件对象。
    * `buff`：待写入数据缓冲区。
    * `btw`：期望写入字节数。
    * `bw`：实际写入字节数输出指针。
*   **返回值**：`FR_OK` 表示接口执行成功；若 `*bw < btw`，表示介质空间不足或写入中途失败。
*   **调用说明**：
    * 文件需以 `FA_WRITE` 模式打开。
    * `f_sync` 会将当前文件缓存写回介质，但不关闭文件。
    * 对关键数据建议写入后检查 `bw`，再调用 `f_sync` 或 `f_close`。

### 移动文件指针与文件大小

```c title="ff.h"
FRESULT f_lseek(FIL *fp, FSIZE_t ofs);
FRESULT f_truncate(FIL *fp);

#define f_tell(fp)    ((fp)->fptr)
#define f_size(fp)    ((fp)->obj.objsize)
#define f_eof(fp)     ((int)((fp)->fptr == (fp)->obj.objsize))
#define f_rewind(fp)  f_lseek((fp), 0)
```

*   **功能**：移动读写位置、截断文件、查询当前位置与文件大小。
*   **参数说明**：
    * `fp`：已打开文件对象。
    * `ofs`：目标文件偏移，单位为字节。
*   **调用说明**：
    * `f_lseek` 可用于随机读写或移动到文件末尾。
    * `f_truncate` 会把文件截断到当前文件指针位置，文件必须以写模式打开。

### 目录操作

```c title="ff.h"
FRESULT f_opendir(DIR *dp, const TCHAR *path);
FRESULT f_readdir(DIR *dp, FILINFO *fno);
FRESULT f_closedir(DIR *dp);
FRESULT f_mkdir(const TCHAR *path);

#define f_rewinddir(dp) f_readdir((dp), 0)
#define f_rmdir(path)   f_unlink(path)
```

*   **功能**：打开目录、遍历目录项、关闭目录、创建目录。
*   **参数说明**：
    * `dp`：目录对象指针。
    * `path`：目录路径。
    * `fno`：目录项信息输出指针。
*   **返回值**：`FR_OK` 表示成功；`f_readdir` 返回 `FR_OK` 且 `fno->fname[0] == 0` 表示目录遍历结束。
*   **调用说明**：
    * `f_rmdir` 是 `f_unlink` 的宏封装，只能删除空目录。
    * 遍历目录时可通过 `fno->fattrib & AM_DIR` 判断当前项是否为目录。

### 文件与目录管理

```c title="ff.h"
FRESULT f_stat(const TCHAR *path, FILINFO *fno);
FRESULT f_unlink(const TCHAR *path);
FRESULT f_rename(const TCHAR *path_old, const TCHAR *path_new);
FRESULT f_getfree(const TCHAR *path, DWORD *nclst, FATFS **fatfs);
```

*   **功能**：查询文件状态、删除文件或空目录、重命名或移动文件、查询剩余空间。
*   **参数说明**：
    * `path`：目标路径。
    * `fno`：文件信息输出对象。
    * `path_old/path_new`：旧路径与新路径。
    * `nclst`：空闲簇数量输出指针。
    * `fatfs`：对应文件系统对象输出指针。
*   **调用说明**：
    * 计算空闲容量时，可使用 `free_bytes = nclst * fatfs->csize * 4096`。
    * 当前未启用文件锁，删除或重命名前应确认目标文件没有处于打开状态。

### 当前路径

```c title="ff.h"
FRESULT f_chdrive(const TCHAR *path);
FRESULT f_chdir(const TCHAR *path);
FRESULT f_getcwd(TCHAR *buff, UINT len);
```

*   **功能**：切换当前逻辑盘、切换当前目录、获取当前目录。
*   **参数说明**：
    * `path`：目标逻辑盘或目录路径。
    * `buff`：当前目录输出缓冲区。
    * `len`：输出缓冲区长度，单位为 `TCHAR`。
*   **调用说明**：当前只有一个逻辑卷，常用流程是 `f_chdrive("0:")` 后使用相对路径访问文件。

### 字符串读写

```c title="ff.h"
TCHAR *f_gets(TCHAR *buff, int len, FIL *fp);
int f_putc(TCHAR c, FIL *fp);
int f_puts(const TCHAR *str, FIL *fp);
int f_printf(FIL *fp, const TCHAR *str, ...);
```

*   **功能**：按字符串方式读取或写入文件。
*   **返回值说明**：
    * `f_gets` 成功时返回 `buff`，到达文件末尾或错误时返回 `NULL`。
    * `f_putc`、`f_puts`、`f_printf` 返回写入字符数，返回负值表示失败。
*   **调用说明**：
    * 当前 `FF_PRINT_LLI = 0`，`f_printf` 不支持 `long long` 参数。
    * 当前 `FF_PRINT_FLOAT = 0`，`f_printf` 不支持浮点格式化。
    * 当前 `FF_USE_STRFUNC = 1`，写入字符串时不会自动进行 LF 到 CRLF 转换。



## 磁盘适配层（diskio.h）
### 磁盘初始化与状态查询

```c title="diskio.h"
DSTATUS disk_initialize(BYTE pdrv);
DSTATUS disk_status(BYTE pdrv);
```

*   **功能**：初始化物理磁盘并查询磁盘状态。
*   **参数说明**：
    * `pdrv`：物理磁盘编号，当前只支持 `0`，对应 `DEV_FLASH`。
*   **返回值**：0 表示磁盘就绪，`STA_NOINIT` 表示未初始化或 Flash 忙。
*   **调用说明**：
    * 应用层通常不需要直接调用，FatFs 会在挂载和访问介质时调用。
    * `disk_initialize(0)` 内部会获取 `sfud_get_device_table() + 0`，并调用 `sfud_init()` 初始化 Flash。
    * `disk_status(0)` 会读取 Flash 状态寄存器，BUSY 位清零时认为介质就绪。

### 扇区读写

```c title="diskio.h"
DRESULT disk_read(BYTE pdrv, BYTE *buff, LBA_t sector, UINT count);
DRESULT disk_write(BYTE pdrv, const BYTE *buff, LBA_t sector, UINT count);
```

*   **功能**：读取或写入连续逻辑扇区。
*   **参数说明**：
    * `pdrv`：物理磁盘编号，当前只支持 `0`。
    * `buff`：读写数据缓冲区。
    * `sector`：起始逻辑扇区号。
    * `count`：连续扇区数量。
*   **地址映射**：
    * Flash 地址计算方式为 `addr = sector << 12`。
    * 数据长度计算方式为 `size = count << 12`。
    * 每个逻辑扇区大小固定为 4096 字节。
*   **调用说明**：
    * `disk_read` 内部调用 `sfud_read`。
    * `disk_write` 内部调用 `sfud_erase_write`，每次写入都会执行擦除并写入流程。
    * 当前文件系统从 Flash 地址 0 开始使用，没有保留偏移区。

### 控制接口

```c title="diskio.h"
DRESULT disk_ioctl(BYTE pdrv, BYTE cmd, void *buff);
```

*   **功能**：向 FatFs 返回介质参数或执行控制命令。
*   **当前实现**：
    * `CTRL_SYNC`：直接返回 `RES_OK`。
    * `GET_SECTOR_COUNT`：返回 2048。
    * `GET_SECTOR_SIZE`：返回 4096。
    * `GET_BLOCK_SIZE`：返回 1。
    * `CTRL_TRIM`：直接返回 `RES_OK`。
*   **容量说明**：当前总容量为 `2048 * 4096 = 8388608` 字节，即 8 MB。

