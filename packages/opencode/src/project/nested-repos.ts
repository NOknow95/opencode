import { Effect } from "effect"
import type { FSUtil } from "@opencode-ai/core/fs-util"
import path from "path"

const SKIP_DIRS = new Set(["node_modules", ".opencode", "dist", "build", ".next", ".cache"])

export function detect(fs: FSUtil.Interface, worktree: string, maxDepth = 4) {
  return walk(fs, worktree, 0, maxDepth)
}

const walk = (fs: FSUtil.Interface, dir: string, depth: number, maxDepth: number): Effect.Effect<string[]> =>
  depth >= maxDepth
    ? Effect.succeed([])
    : Effect.gen(function* () {
        const entries = yield* fs.readDirectoryEntries(dir).pipe(Effect.catch(() => Effect.succeed([])))
        const results: string[] = []

        for (const entry of entries) {
          if (entry.name === ".git") continue
          if (SKIP_DIRS.has(entry.name)) continue
          if (entry.type !== "directory") continue

          const absPath = path.join(dir, entry.name)
          const hasGit = yield* fs.exists(path.join(absPath, ".git")).pipe(Effect.catch(() => Effect.succeed(false)))
          if (hasGit) {
            results.push(absPath)
          } else {
            results.push(...(yield* walk(fs, absPath, depth + 1, maxDepth)))
          }
        }

        return results
      })

export * as NestedRepos from "./nested-repos"
