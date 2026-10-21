# fcc Small C Compiler

A component that compiles and executes small C programs on the target board.

- Component ID: `fcc`
- Header: `fcc.h`
- Dependencies: `fatfs`, `letter-shell`; requires the Target to declare `rv32im-exec-sram`
- Example: `examples/storage/fcc`
- Currently supported only on C2

## Entry

```c
int fccCmd(int argc, char *argv[]);      /* fcc <source.c> */
int fccRunCmd(int argc, char *argv[]);   /* fcc-run */
```

The example mounts an existing FatFs volume and registers these two commands in the Shell:

- `fcc <source.c>`: compiles the source into the 32 KiB on-chip SRAM reserved by the linker script;
- `fcc-run`: executes the parameterless `main` from the most recent successful compilation.

## Limits and Constants

```c
#define FCC_CODE_MAX (32 * 1024)   /* Generated code limit: 32 KiB */
#define FCC_SRC_MAX  (32 * 1024)   /* Source limit: 32 KiB */
#define MAX_VARS     256
#define MAX_FUNCS    64
```

The global variable area is 1 KiB. If compilation fails, execution of the previously generated code is prohibited.

## Language Scope

It implements only integers, functions, conditions, loops, and a small set of operators; it is not a complete C compiler:

- Types: `int`;
- Statements: declarations, assignments, `return`, `if`/`else`, `while`;
- Operators: arithmetic, comparison, logical, and assignment operations;
- Functions: take several `int` arguments and return `int`;
- Structs, pointers, arrays, floating point, string libraries, etc. are not supported.

## Notes

- Both the source and the generated code have a 32 KiB limit; compilation fails when exceeded.
- The compilation output is written to the execution SRAM reserved by the linker script and must not conflict with the stack/heap in use.
- The two C2 boot profiles have completed cross-builds and address checks; real-board execution, stack headroom, and file system
  read/write still need to be confirmed according to the manual acceptance checklist.
- The component and example are not yet part of the official release.
- For the file system interface, see [fatfs](fatfs.md); for command interaction, see [letter-shell](letter-shell.md).
