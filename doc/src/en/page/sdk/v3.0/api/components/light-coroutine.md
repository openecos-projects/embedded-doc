# LightCoroutine Coroutines

Stackless cooperative coroutines based on GCC computed-goto, used to organize multiple logical tasks on a bare-metal single thread.

- Component ID: `light-coroutine`
- Header: `coroutine.h`, `yield.h`; configuration in `conf.h`
- Example: `examples/concurrency/coroutine-smoke`

The component does not depend on any specific peripheral; the source uses GCC's computed-goto extension,
which is covered by the SDK 3.0 RISC-V GCC toolchain.

## Task API

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
void task_scheduler(int round);   /* round = number of scheduling rounds; -1 runs forever */
```

| Function | Description |
| --- | --- |
| `create_task()` | Create a task and return the task object |
| `delete_task()` | Delete a task |
| `suspend_task()` / `resume_task()` | Suspend/resume a task |
| `task_scheduler()` | Run the scheduler; `-1` means run forever and does not return |

## Programming Macros (yield.h)

```c
TASK_BEGIN(t)               /* Start of the task function; resume point */
TASK_YIELD(t)               /* Voluntarily yield */
TASK_WAIT(t, cond)          /* Suspend and wait while the condition is not met */
TASK_END(t)                 /* End the task and deregister it */
TASK_YIELD_DETAILED(t, post)                            /* Yield with a cleanup statement */
TASK_WAIT_DETAILED(t, pre, cond, post_false, post_true) /* Wait with pre/post statements */
LOCAL(...)                  /* Declare locals preserved across switch-out (requires USE_CTX) */
```

Task functions must be wrapped in `TASK_BEGIN` … `TASK_END`. Ordinary local variables after `TASK_YIELD` / `TASK_WAIT`
are lost after switch-out; variables that must be preserved should be declared with `LOCAL(...)` and accessed via
`local.<field>`.

## Configuration (conf.h)

| Macro | Default | Description |
| --- | --- | --- |
| `MAX_TASK_NUM` | 10 | Maximum number of tasks |
| `USE_CTX` | defined | Enable context saving (`LOCAL` takes effect) |
| `TASK_CTX_SIZE` | 64 | Per-task context size (number of `uint32_t`) |
| `USE_IDLE_TASK` | defined | Enable the idle task |

Corresponding menuconfig options: `CONFIG_COMPONENT_COROUTINE*`.

## Minimal Skeleton

```c
#include "coroutine.h"

static task_t handler;

static void blink_task(task_t *t)
{
    LOCAL();
    TASK_BEGIN(t);
    for (;;) {
        /* ...work... */
        TASK_YIELD(t);
    }
    TASK_END(t);
}

int main(void)
{
    handler = create_task(0, blink_task, NULL);
    task_scheduler(-1);   /* schedule forever, does not return */
    return 0;
}
```

## Notes

- Cooperative scheduling: tasks must actively `TASK_YIELD` or `TASK_WAIT`; there is no preemption.
- The stackless design means a task cannot block inside an ordinary function call; long tasks should be split into multiple yields.
- `task_scheduler(-1)` does not return, so code after it will not execute.
- When true stack-based blocking or interrupt-driven tasks are needed, use a layered state machine or main-loop polling instead.
