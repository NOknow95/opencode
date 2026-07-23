import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260722121928_talented_toro",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`ALTER TABLE \`project\` ADD \`nested\` text;`)
    })
  },
} satisfies DatabaseMigration.Migration
