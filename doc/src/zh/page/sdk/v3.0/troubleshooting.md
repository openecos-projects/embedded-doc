# 故障排查

## 常见问题

| 现象 | 排查方式 |
| --- | --- |
| `ecos: command not found` | 重新加载 Shell 启动文件或打开新终端；确认安装器已配置 PATH |
| 找不到 Kconfiglib | 运行 `python3 tools/install.py` 安装锁定依赖 |
| 解析到了错误的 SDK | `ecos sdk current --format json`，检查 `--sdk`、工程 pin 和 active SDK 的优先级 |
| 工具链状态异常 | `ecos toolchain status --format json`、`ecos toolchain install --dry-run` |
| Board/Target 不匹配 | 使用 `ecos project set-board <board>` 让 Target 由 Board 派生，再 `ecos validate` |
| 缺少外设能力 | `ecos board describe <board>` 和 `ecos project list` 查看资源与能力 |
| 构建产物缺失 | `ecos build --format json` 会报告缺少 ELF/BIN/HEX/MAP/size 或编译数据库 |
| 烧录器未找到 | `ecos doctor --project . --format json`；L4C1 可用 `--device` 指定挂载目录 |
| 串口监视不退出 | JSON 模式需要 `--timeout` 或 `--expect` |
| 工程名报错 | 工程名只能是一个 ASCII 路径段，允许字母、数字、`.`、`_`、`-` |

## 完整环境诊断

```bash
ecos doctor --project . --format json
ecos sdk doctor --format json
ecos toolchain status --format json
```

安装问题见[安装 SDK 3.0](install.md)，命令诊断见 [`ecos` 命令行工具](cli.md)。
