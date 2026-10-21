# fcc 小型 C 编译器

在目标板上编译并执行小型 C 程序的组件。

- 组件 ID：`fcc`
- 头文件：`fcc.h`
- 依赖：`fatfs`、`letter-shell`；要求 Target 声明 `rv32im-exec-sram`
- 示例：`examples/storage/fcc`
- 当前只有 C2 支持

## 入口

```c
int fccCmd(int argc, char *argv[]);      /* fcc <source.c> */
int fccRunCmd(int argc, char *argv[]);   /* fcc-run */
```

示例挂载已有 FatFs 卷，在 Shell 中注册这两个命令：

- `fcc <source.c>`：把源码编译到链接脚本预留的 32 KiB 片内 SRAM；
- `fcc-run`：执行最近一次成功编译的无参 `main`。

## 限制与常量

```c
#define FCC_CODE_MAX (32 * 1024)   /* 生成代码上限 32 KiB */
#define FCC_SRC_MAX  (32 * 1024)   /* 源码上限 32 KiB */
#define MAX_VARS     256
#define MAX_FUNCS    64
```

全局变量区 1 KiB。编译失败会禁止执行上一次生成的代码。

## 语言范围

只实现整数、函数、条件、循环和少量运算符，不是完整 C 编译器：

- 类型：`int`；
- 语句：声明、赋值、`return`、`if`/`else`、`while`；
- 运算符：算术、比较、逻辑和赋值运算；
- 函数：带若干 `int` 参数、返回值 `int`；
- 不支持结构体、指针、数组、浮点、字符串库等。

## 注意事项

- 源码和生成代码都有 32 KiB 上限；超限时编译失败。
- 编译产物写入链接脚本预留的执行 SRAM，不能与正在使用的栈/堆冲突。
- 两个 C2 启动 profile 已完成交叉构建和地址检查；实板运行、栈余量与文件系统
  读写仍需按人工验收清单确认。
- 组件和示例暂不进入正式 release。
- 文件系统接口见 [fatfs](fatfs.md)，命令交互见 [letter-shell](letter-shell.md)。
