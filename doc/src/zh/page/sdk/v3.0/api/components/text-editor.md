# text-editor 文本编辑器

基于 FatFs 与 Letter-Shell 的终端文本编辑器。

- 组件 ID：`text-editor`
- 头文件：`text_editor.h`
- 依赖：`fatfs`、`letter-shell`；要求 Target 声明 `ram-64k` 能力
- 示例：`examples/storage/text-editor`

!!! warning "资源与发布范围"

    编辑器状态约占 42 KiB 静态 RAM；T1-Pico 片内 RAM 不足，L3 缺少示例所需的
    QSPI 资源。当前示例支持 C1、C2、L3.1 和 L4 C1/C2/C3。

    组件和示例仍从正式 release 排除；保存、重启后读取、终端兼容性及掉电行为需要
    实板验收。

## 入口

```c
int editCmd(int argc, char *argv[]);
```

接受 `edit <filename>`。示例挂载已有 FatFs 卷，并在自己的 Letter-Shell 命令表
注册 `edit` 和文件系统命令。

## 限制与常量

```c
#define MAX_FILE_SIZE   (24 * 1024)   /* 单文件上限 24 KiB */
#define MAX_LINES       8192          /* 最大行数 */
#define MAX_FILENAME    256
#define DEFAULT_ROWS    24            /* 默认终端 24 行 */
#define DEFAULT_COLS    80            /* 默认终端 80 列 */
```

编辑器使用 BSP console 处理输入和 ANSI 屏幕输出，不直接访问 UART 寄存器。

## 按键

| 按键 | 行为 |
| --- | --- |
| 方向键 | 移动光标 |
| 回车 | 换行 |
| 退格 | 删除前一个字符 |
| Tab | 插入制表符 |
| `Ctrl+W` | 保存 |
| `Esc` | 退出；有未保存内容时需再次按 `Esc` 才会丢弃 |

## 注意事项

- 单文件最多 24 KiB、8192 行，超限时拒绝加载或插入。
- 示例不会自动格式化空 Flash；格式化前须先备份卷内数据。
- 编辑器依赖 Letter-Shell 的命令表和 FatFs 卷；挂载失败时无法启动。
- ANSI 输出要求终端支持相应转义序列；终端兼容性仍需实板验收。
- 组件与文件系统接口见 [letter-shell](letter-shell.md) 和 [fatfs](fatfs.md)。
