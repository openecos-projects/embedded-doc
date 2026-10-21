# 工程与配置

本页说明工程的目录结构、`.ecos/project.yml`、profile 选择和构建边界。

## 工程结构

创建后的工程只包含应用源码、CMake 入口和工程元数据：

```text
myhello/
├── .ecos/
│   ├── project.yml        # 工程元数据：Example、Board、Target、profile、SDK pin
│   └── sdk.json           # 本机 SDK 解析信息（不可提交）
├── CMakeLists.txt         # 工程入口，不保存 Board/Target/组件依赖
├── ecos-example.yml       # Example 清单副本
├── main.c                 # 应用源码
└── README.md
```

`.ecos/project.yml` 的典型内容：

```yaml
schema: 2
name: "myhello"
example: "hello"
board: "starrysky-l4-c1"
target: "ysyx-2512-1"
profile: null
sdk:
  id: "ecos-embedded-sdk"
  version: "3.0.0"
  registration: "3.0.0"
```

`profile: null` 表示使用所选 Board 的默认 profile（例如 L4C1 为 `memory`）；
`ecos validate` 和 `ecos project info` 会显示最终解析出的 profile。

!!! warning "不要手工复制 SDK 内容"

    工程元数据不记录 SDK 的绝对路径。切换 Board 时，CLI 只更新工程元数据和
    生成文件，不会替换 `main.c`、`CMakeLists.txt` 等用户维护的文件。

## profile

profile 是 Board 预定义的配置组合，用于选择启动和内存布局等：

| Board | profile | 典型用途 |
| --- | --- | --- |
| `starrysky-l4-c1` / `l4-c2` / `l4-c3` | `memory` | 运行在内存布局（链接配置由 Board 决定） |
| `starrysky-t1-pico` | `flash_xip` | Flash XIP + DSRAM |
| `starrysky-l3` / `starrysky-l3-1` | `flash-xip` | Flash XIP |
| `starrysky-l3` / `starrysky-l3-1` | `mem` | 内存运行 |
| `starrysky-c1` | `flash-xip` | Flash XIP |
| `starrysky-c2` | `flash-xip` | Flash XIP + SRAM 数据区 |
| `starrysky-c2` | `psram-data` | 数据区放在 PSRAM |

```bash
ecos project set-profile mem
ecos project info --format json
```

## 构建边界

- `.ecos/project.yml`、Board/Target/Component/Example 清单和 Kconfig 是输入事实来源。
- 生成文件只放在 `build/` 或 `.ecos/generated/`，不需要手工编辑。
- 启动文件和链接脚本由 Target/Board 清单解析后绑定到固件目标，不复制到工程。
- `CMakeLists.txt` 只声明工程和应用组件，不重复保存 Board、Target 或工具链信息。
- 不支持的 Board/Target/Example 组合会在编译前失败，并指出缺少的能力。

应用接口从[应用开发](api/index.md)开始；创建和烧录流程见[快速上手](quickstart.md)。
