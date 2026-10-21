# Embedded Documentation

ECOS 文档站点，基于 MkDocs Material 构建，包含中文（`doc/src/zh`）和英文
（`doc/src/en`）两套文档。

## 本地预览

### 依赖

- Python 3.10+
- Node.js 18+ / npm
- 能访问 GitHub 的 `website-res` 和 `website-tpl-mkdocs` 仓库

### 首次准备

```bash
make -C doc setup        # 克隆 doc/res、doc/tpl，并建立 src/{zh,en}/res 软链接
make -C doc check-venv   # 创建 doc/.venv 并安装 mkdocs 及插件
make -C doc check-node   # 安装 Tailwind CSS 和图片压缩依赖
```

### 启动预览

```bash
READTHEDOCS_CANONICAL_URL=http://127.0.0.1:8000/ make -C doc serve-doc
```

`serve-doc` 会先执行 `gen-doc`，包括重新生成 Tailwind CSS 和压缩 WebP 图片。如果
不需要重新生成这些资源，可以直接启动 MkDocs：

```bash
READTHEDOCS_CANONICAL_URL=http://127.0.0.1:8000/ \
  doc/.venv/bin/mkdocs serve -f doc/mkdocs_zh.yml --dev-addr 127.0.0.1:8000
```

英文站使用 `MKDOCS_LANG=en`：

```bash
MKDOCS_LANG=en READTHEDOCS_CANONICAL_URL=http://127.0.0.1:8000/ make -C doc serve-doc
```

### 仅构建

```bash
READTHEDOCS_CANONICAL_URL=http://127.0.0.1:8000/ \
  doc/.venv/bin/mkdocs build -f doc/mkdocs_zh.yml --site-dir /tmp/embedded-doc-site
```
