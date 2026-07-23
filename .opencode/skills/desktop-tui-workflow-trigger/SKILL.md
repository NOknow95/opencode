---
name: desktop-tui-workflow-trigger
description: Trigger GitHub Actions to build macOS universal DMG and TUI binary, then publish release
---

# Desktop + TUI Workflow Trigger

在 fork 仓库的 `dev-my` 分支上触发 `package-desktop-mac-universal` workflow，自动打包：
1. macOS universal DMG（桌面版，Intel + Apple Silicon）
2. macOS arm64 TUI 二进制（CLI 版）

并发布到 GitHub Release。

## Workflow

### 1. 询问用户输入

触发前必须逐一询问以下三项，确认后再执行：

**Version**（必填）
- 格式：`x.y.z` 或 `x.y.z-alpha.n` 等 semver

**Title**（可选，默认 `v{version}`）
- Release 标题，不填则用 `v{version}`

**Notes**（可选，默认 `Auto-built from dev-my branch`）
- Release notes，支持 markdown

### 2. 触发 workflow

```bash
gh workflow run package-desktop-mac-universal --ref dev-my \
  -f version="{version}" \
  -f title="{title}" \
  -f notes="{notes}"
```

返回 Actions run 链接给用户。

## 产物

Release 中包含：
- `opencode-desktop-mac-universal.dmg` — 桌面版安装包
- `opencode-darwin-arm64.tar.gz` — TUI CLI 二进制
