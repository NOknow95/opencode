import { describe, expect, it } from "bun:test"
import { Effect } from "effect"
import { NestedRepos } from "@/project/nested-repos"
import { FSUtil } from "@opencode-ai/core/fs-util"
import { CrossSpawnSpawner } from "@opencode-ai/core/cross-spawn-spawner"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { tmpdir } from "../fixture/fixture"
import fs from "fs/promises"
import path from "path"

const layer = LayerNode.compile(LayerNode.group([FSUtil.node, CrossSpawnSpawner.node]))

const detect = (root: string, maxDepth?: number) =>
  FSUtil.Service.use((fs) => NestedRepos.detect(fs, root, maxDepth))

describe("NestedRepos", () => {
  it("detects nested git repos at depth 1", async () => {
    await using root = await tmpdir({ git: true })
    const nested = path.join(root.path, "web")
    await fs.mkdir(nested, { recursive: true })
    await Bun.$`git init -q`.cwd(nested)

    const result = await Effect.runPromise(detect(root.path).pipe(Effect.provide(layer)))
    expect(result).toContain(nested)
  })

  it("skips non-git directories", async () => {
    await using root = await tmpdir({ git: true })
    const plain = path.join(root.path, "src")
    await fs.mkdir(plain, { recursive: true })

    const result = await Effect.runPromise(detect(root.path).pipe(Effect.provide(layer)))
    expect(result).not.toContain(plain)
  })

  it("detects repos at depth 2", async () => {
    await using root = await tmpdir({ git: true })
    const inner = path.join(root.path, "packages", "ui")
    await fs.mkdir(inner, { recursive: true })
    await Bun.$`git init -q`.cwd(inner)

    const result = await Effect.runPromise(detect(root.path, 2).pipe(Effect.provide(layer)))
    expect(result).toContain(inner)
  })

  it("skips node_modules", async () => {
    await using root = await tmpdir({ git: true })
    const nm = path.join(root.path, "node_modules", "pkg")
    await fs.mkdir(nm, { recursive: true })
    await Bun.$`git init -q`.cwd(nm)

    const result = await Effect.runPromise(detect(root.path).pipe(Effect.provide(layer)))
    expect(result).not.toContain(nm)
  })
})
