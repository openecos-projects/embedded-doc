# LightCoroutine 协程

基于 GCC computed-goto 的无栈协作式协程，用于在裸机单线程上组织多个逻辑任务。

- 组件 ID：`light-coroutine`
- 头文件：`coroutine.h`、`yield.h`，配置见 `conf.h`
- 示例：`examples/concurrency/coroutine-smoke`

组件不依赖具体外设；源码使用 GCC 的 computed-goto 扩展，SDK 3.0 的 RISC-V GCC
工具链已覆盖该语法。

## 任务 API

```c
typedef struct task_t {
    int id;
    void *resume_point;
    void (*func)(struct task_t *);
    void *args;
} task_t;

typedef void (*func_t)(task_t *);

task_t create_task(int id, func_t func, void *args);
void delete_task(task_t *task_handler);
void suspend_task(task_t *task_handler);
void resume_task(task_t *task_handler);
void task_scheduler(int round);   /* round = 调度轮数；-1 永久运行 */
```

| 函数 | 说明 |
| --- | --- |
| `create_task()` | 创建任务并返回任务对象 |
| `delete_task()` | 删除任务 |
| `suspend_task()` / `resume_task()` | 挂起/恢复任务 |
| `task_scheduler()` | 运行调度器；`-1` 表示永久运行，不返回 |

## 编程模型宏（yield.h）

```c
TASK_BEGIN(t)               /* 任务函数开头，恢复断点 */
TASK_YIELD(t)               /* 主动让出 */
TASK_WAIT(t, cond)          /* 条件不满足则挂起等待 */
TASK_END(t)                 /* 任务结束并注销 */
TASK_YIELD_DETAILED(t, post)                            /* 带善后语句的让出 */
TASK_WAIT_DETAILED(t, pre, cond, post_false, post_true) /* 带前置/后置语句的等待 */
LOCAL(...)                  /* 声明跨切出保持的局部变量（需 USE_CTX） */
```

任务函数必须按 `TASK_BEGIN` … `TASK_END` 包裹。`TASK_YIELD` / `TASK_WAIT` 之后的
普通局部变量在切出后丢失；需要保持的变量用 `LOCAL(...)` 声明，并通过
`local.<field>` 访问。

## 配置（conf.h）

| 宏 | 默认 | 说明 |
| --- | --- | --- |
| `MAX_TASK_NUM` | 10 | 最大任务数 |
| `USE_CTX` | 定义 | 启用上下文保存（`LOCAL` 生效） |
| `TASK_CTX_SIZE` | 64 | 每任务上下文大小（`uint32_t` 个数） |
| `USE_IDLE_TASK` | 定义 | 启用空闲任务 |

menuconfig 对应项：`CONFIG_COMPONENT_COROUTINE*`。

## 最小使用骨架

```c
#include "coroutine.h"

static task_t handler;

static void blink_task(task_t *t)
{
    LOCAL();
    TASK_BEGIN(t);
    for (;;) {
        /* …工作… */
        TASK_YIELD(t);
    }
    TASK_END(t);
}

int main(void)
{
    handler = create_task(0, blink_task, NULL);
    task_scheduler(-1);   /* 永久调度，不返回 */
    return 0;
}
```

## 注意事项

- 协作式调度：任务必须主动 `TASK_YIELD` 或 `TASK_WAIT`，没有抢占。
- 无栈设计意味着任务不能阻塞在普通函数调用中；长任务应拆分为多次让出。
- `task_scheduler(-1)` 不返回，之后的代码不会执行。
- 需要真正的栈上阻塞或中断驱动任务时，应改用分层状态机或主循环轮询。
