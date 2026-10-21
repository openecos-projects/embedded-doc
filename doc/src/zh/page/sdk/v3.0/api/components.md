# Component 组件

SDK 3.0 中可供应用使用的组件：C 运行库子集、堆、协程、串行 Flash、文件系统、
命令行、文件系统命令、软件 SPI、文本编辑器和 C 编译器。

- 头文件：各组件 `include/` 目录（见各页面）
- 示例：`examples/storage/*`、`examples/concurrency/*`
- 组件 ID：在 Example 清单中声明后才会进入构建图

!!! note "首批 release 的组件范围"

    当前 `tools/sdk-manifest.json` 的 `release.exclude` 在首发发布包中排除了
    FatFs、FCC、Letter-Shell、letter-shell-fs 和 text-editor；这些组件目前需要
    在 development checkout 中使用。以后续版本的清单为准。

    真实 Flash 挂载、文件读写、终端交互和掉电恢复需按人工验收清单完成后再解除
    发布排除。

## 组件索引

### 基础运行时

| 组件 | 头文件 | 说明 |
| --- | --- | --- |
| [libc 子集](components/libc.md) | `stdio.h`、`string.h`、`assert.h` | 内存、字符串和格式化输出 |
| [heap](components/heap.md) | `ecos/heap.h` | 双区堆内存分配 |
| [LightCoroutine](components/light-coroutine.md) | `coroutine.h`、`yield.h` | 无栈协作式协程 |

### 存储

| 组件 | 头文件 | 说明 |
| --- | --- | --- |
| [sfud](components/sfud.md) | `sfud.h` | 串行 Flash 通用驱动 |
| [fatfs](components/fatfs.md) | `ff.h`、`ffinit.h` | FAT 文件系统 |

### Shell 与工具

| 组件 | 头文件 | 说明 |
| --- | --- | --- |
| [letter-shell](components/letter-shell.md) | `shell.h` | 命令行交互 |
| [letter-shell-fs](components/letter-shell-fs.md) | `ecos/shell/fs.h` | 文件系统命令 |
| [text-editor](components/text-editor.md) | `text_editor.h` | 终端文本编辑器 |
| [fcc](components/fcc.md) | `fcc.h` | 小型 C 编译器 |

### 总线

| 组件 | 头文件 | 说明 |
| --- | --- | --- |
| [soft-spi](components/soft-spi.md) | `ecos/soft_spi.h` | GPIO 位 bang SPI |

## 注意事项

- 组件需要在 Example 清单中声明组件 ID 才会进入构建图；未声明的组件无法直接
  包含头文件使用。
- 组件 ID 与 menuconfig 配置项以当前 `tools/sdk-manifest.json` 和
  `ecos menuconfig` 为准。
- 单线程裸机模型：heap、Shell 和文件系统都不保证中断上下文安全。
- `soc`（SDK 内部 SoC 层）和 `libgcc`（编译器内部例程）不属于应用向组件。
- 底层外设接口见 [Driver 驱动层](driver.md)，外部器件见 [Device 驱动](device.md)。
