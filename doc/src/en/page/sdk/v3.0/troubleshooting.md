# Troubleshooting

## Common Issues

| Symptom | Diagnosis |
| --- | --- |
| `ecos: command not found` | Reload the shell startup file or open a new terminal; confirm the installer configured PATH |
| Kconfiglib not found | Run `python3 tools/install.py` to install the pinned dependencies |
| Wrong SDK resolved | `ecos sdk current --format json`; check the priority of `--sdk`, the project pin, and the active SDK |
| Abnormal toolchain status | `ecos toolchain status --format json`, `ecos toolchain install --dry-run` |
| Board/Target mismatch | Use `ecos project set-board <board>` so that the Target is derived from the Board, then run `ecos validate` |
| Missing peripheral capability | Use `ecos board describe <board>` and `ecos project list` to inspect resources and capabilities |
| Missing build artifacts | `ecos build --format json` reports missing ELF/BIN/HEX/MAP/size or compilation database |
| Flasher not found | `ecos doctor --project . --format json`; for L4C1, `--device` can specify the mount directory |
| Serial monitor does not exit | JSON mode requires `--timeout` or `--expect` |
| Project name error | A project name must be a single ASCII path segment and may contain letters, digits, `.`, `_`, and `-` |

## Full Environment Diagnostics

```bash
ecos doctor --project . --format json
ecos sdk doctor --format json
ecos toolchain status --format json
```

For installation issues, see [Installing SDK 3.0](install.md); for command diagnostics, see the [`ecos` command-line tool](cli.md).
