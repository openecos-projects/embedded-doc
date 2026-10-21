# 快速上手：创建第一个工程

以下以 `starrysky-l4-c1` 为例。工程应创建在 SDK 目录之外。

## 创建工程

```bash
mkdir -p ~/ecos-workspace
cd ~/ecos-workspace

# 查看可用 Example 及其兼容 Board
ecos project list

# 从 hello 创建工程
ecos project create hello --name myhello --board starrysky-l4-c1
cd myhello
```

`--board` 与 `--target` 互斥：

- `--board` 选择完整板级支持，Target 由 Board 清单派生。
- `--target` 只选择 SoC，适合尚未绑定具体板卡的工程，此时 Board 为空。

工程创建后的目录结构和 `.ecos/project.yml` 说明见[工程与配置](project.md)。

## 校验与配置

```bash
ecos validate --project .
ecos configure --project .
```

`ecos configure` 只写 `.ecos/generated/`，原子维护以下文件：

- `resolved-project.json`：唯一的已解析工程模型；
- `resolved-project.cmake`、`sdkconfig.cmake`：CMake 输入；
- `Kconfig`、`.config`、`sdkconfig.h`：Kconfig 输入和输出；
- `configuration.fingerprint`：解析和配置指纹。

需要修改板级或驱动选项时：

```bash
ecos menuconfig
```

`menuconfig` 使用 Kconfiglib 的终端界面，选择结果持久化到
`.ecos/project.config`，退出后自动执行与 `ecos configure` 相同的派生配置生成。
该命令必须在交互式终端中运行。

## 构建

```bash
ecos build --project .
```

构建使用 CMake + Ninja，并在成功后写入 `build/artifacts.json`。以 L4C1 为例，
`build/` 中会生成：

| 产物 | 说明 |
| --- | --- |
| `retrosoc_fw.elf` | 带符号的 ELF |
| `retrosoc_fw.bin` | 烧录用二进制 |
| `retrosoc_fw.hex` | Intel HEX |
| `retrosoc_fw.txt` | 反汇编/辅助文本 |
| `retrosoc_fw.map` | 链接映射 |
| `retrosoc_fw.size` | 段大小报告 |
| `compile_commands.json` | 编译数据库，供编辑器和工具使用 |
| `artifacts.json` | 产物路径、大小、SHA-256、SDK/Board/Target/工具链和指纹 |

`artifacts.json` 还记录配置指纹。修改 Board、profile 或配置后必须重新
`ecos configure` 和 `ecos build`；`ecos flash` 只接受摘要完整且配置未过期的产物。

## 烧录与串口监视

```bash
ecos flash --project .
ecos monitor --project . --port /dev/ttyUSB0
```

- `ecos flash` 根据 Board 清单选择烧录方式，并从 `artifacts.json` 读取固件路径，
  不会猜测文件名。L4C1 使用 mass-storage 方式：CLI 在 Linux/macOS/Windows 上
  查找对应卷标，也可通过 `--device <挂载目录>` 显式指定。
- `ecos monitor` 使用 PySerial 发现或打开串口；波特率由 Board 清单配置决定，
  可用 `--baudrate` 覆盖。
- JSON 模式下监视命令必须通过 `--timeout` 或 `--expect` 保证能够结束。

## 切换板卡

同一份应用源码可以通过修改工程元数据构建到其他兼容板卡：

```bash
ecos project set-board starrysky-l4-c2
ecos configure
ecos build
```

`set-board` 会用 Board 清单中的映射覆盖 Target；`set-target` 则写入指定 Target
并把 Board 清空。两个命令都支持 `--dry-run`，用于先查看变更而不写入文件。

## 下一步

- 需要修改 profile 或了解构建边界：[工程与配置](project.md)
- 开始写应用：[应用开发](api/index.md)
- 浏览现成 Example：[示例工程](examples.md)
