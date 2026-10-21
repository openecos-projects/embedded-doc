# `ecos` 命令行工具

## 命令结构

```text
ecos [--sdk NAME|VERSION|PATH] <command> [subcommand] [arguments] [options]
```

命令采用“管理能力分组、高频工程操作扁平化”的模型：

- 资源管理使用分组：`ecos project create`、`ecos sdk list`、`ecos board describe`。
- 当前工程的高频操作直接位于根命令：`ecos configure`、`ecos build`、`ecos flash`。

SDK 路径解析优先级固定为：

1. 单次命令的 `--sdk`；
2. 工程元数据中的 SDK pin；
3. `ECOS_SDK_HOME` 兼容变量；
4. 用户注册表中的 active SDK；
5. 从 SDK 源码入口识别出的 checkout。

高优先级选择存在但无效时会直接报错，不会静默回退到其他 SDK。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `ecos sdk register PATH` | 注册 SDK checkout 或 release 安装 |
| `ecos sdk list / current / use / pin / doctor` | 查询、切换、固定和诊断 SDK |
| `ecos toolchain detect / status / install` | 工具链识别、状态检查与安装 |
| `ecos project list` | 列出 Example、能力需求和兼容 Board |
| `ecos project create EXAMPLE` | 从 Example 创建外部工程 |
| `ecos project set-board BOARD` | 切换 Board，并派生 Target |
| `ecos project set-target TARGET` | 只选择 Target，清空 Board |
| `ecos project set-profile PROFILE` | 切换配置 profile |
| `ecos project info` | 查看工程选择、配置和构建状态 |
| `ecos board / target / component / driver / device list` | 发现资源 |
| `ecos board / target / component / driver / device describe ID` | 查看资源详情 |
| `ecos schema list / describe / validate` | 查询和校验清单 schema |
| `ecos validate` | 只读校验工程与清单 |
| `ecos configure` | 生成 resolved project、CMake 和 Kconfig 配置 |
| `ecos menuconfig` | 进入交互式 Kconfig 配置界面 |
| `ecos build` | 使用 CMake + Ninja 构建固件 |
| `ecos clean` | 删除当前工程的构建目录 |
| `ecos doctor` | 检查工程、宿主工具、工具链、烧录器和串口 |
| `ecos flash` | 按 Board 配置烧录 `artifacts.json` 中的固件 |
| `ecos monitor` | 打开跨平台串口监视器 |
| `ecos completion bash\|zsh\|fish\|powershell` | 输出 Shell 补全脚本 |

常用示例：

```bash
ecos project list --format json
ecos board describe starrysky-l4-c1 --format json
ecos target describe ysyx-2512-1 --format json
ecos component describe driver-gpio --format json
ecos --sdk 3.0.0 project create hello --name hello-demo
```

## 机器可读输出与退出码

所有发现、检查、验证和诊断命令都支持 `--format json`。JSON 顶层固定包含：

```text
cli_version
schema_version
command
status
data
diagnostics
```

JSON 写入标准输出，日志、警告和进度写入标准错误；机器模式不包含颜色控制符。
`ecos validate --format json` 的 `data.graph` 直接给出应用源码、Target 源码、
Component 依赖和最终产物，自动化工具不需要解析 CMake/Ninja 文件。

| 退出码 | 含义 |
| --- | --- |
| `0` | 成功 |
| `2` | 用法或参数错误 |
| `3` | SDK、注册表、清单或配置错误 |
| `4` | 不支持的宿主平台或架构 |
| `5` | 工具链校验、解压或外部程序错误 |
| `6` | 网络下载错误 |

## 自动化与 AI 使用

3.0 的 CLI 同时面向人、CI 和 AI，关键约定：

- 参数完整时不会出现交互式提问；每个交互命令都有等价的非交互参数。
- 工程相关命令支持显式指定工程目录（`--project PATH`），不依赖当前工作目录。
- 查询和校验命令无副作用；修改类命令支持 `--dry-run`。
- 重复设置 Board、profile 等操作保持幂等。
- 默认不覆盖用户源码；覆盖或删除必须显式传入 `--force`。
- `--format json` 提供稳定 envelope、诊断数组和退出码。

自动化推荐流程：

```bash
ecos project list --format json
ecos board describe starrysky-l4-c1 --format json
ecos project create hello --name ci-hello --board starrysky-l4-c1 --format json
ecos validate --project ci-hello --format json
ecos configure --project ci-hello --format json
ecos build --project ci-hello --format json
```

`ecos validate --format json` 的 `data.graph` 可用于在编译前检查实际源码、
include、组件依赖和产物列表。

安装与工具链安装命令见[安装 SDK 3.0](install.md)。
