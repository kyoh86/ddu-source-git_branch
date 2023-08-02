import {
  ActionFlags,
  BaseKind,
} from "https://deno.land/x/ddu_vim@v3.4.4/types.ts";
import type { Actions } from "https://deno.land/x/ddu_vim@v3.4.4/types.ts";
import { fn } from "https://deno.land/x/ddu_vim@v3.4.4/deps.ts";
import { pipe } from "../ddu-source-git_branch/message.ts";

export type ActionData = {
  isHead: boolean;
  refName: RefName; // ref name
  upstream: RefName; // upstream (following) name
  author: string; // last commit author name
  date: string; // last commit date
  cwd: string;
};

export type RefName = {
  remote: string; // remote name (like "origin" if it is for remote)
  branch: string; // branch name (like "main")
};

type Params = Record<never, never>;

export class Kind extends BaseKind<Params> {
  override actions: Actions<Params> = {
    switch: async ({ denops, items }) => {
      if (items.length != 1) {
        await denops.call(
          "ddu#util#print_error",
          "invalid action calling: it can accept only one item",
          "ddu-kind-git_branch",
        );
        return ActionFlags.None;
      }
      const { cwd, refName } = items[0].action as ActionData;
      if (refName.remote == "") {
        await pipe(denops, "git", { cwd, args: ["switch", refName.branch] });
        return ActionFlags.None;
      }
      await pipe(denops, "git", {
        cwd,
        args: [
          "switch",
          "--guess",
          "--track",
          `${refName.remote}/${refName.branch}`,
        ],
      });
      return ActionFlags.None;
    },
    delete: async ({ denops, items }) => {
      for (const item of items) {
        const { cwd, refName } = item.action as ActionData;
        await pipe(denops, "git", {
          cwd,
          args: ["branch", "-d", refName.branch],
        });
      }
      return ActionFlags.None;
    },
    deleteForce: async ({ denops, items }) => {
      for (const item of items) {
        const { cwd, refName } = item.action as ActionData;
        await pipe(denops, "git", {
          cwd,
          args: ["branch", "-D", refName.branch],
        });
      }
      return ActionFlags.None;
    },
    create: async ({ denops, items }) => {
      const { cwd } = items[0].action as ActionData;
      const branchName = await fn.input(
        denops,
        "Create branch name you entered => ",
      );
      await pipe(denops, "git", { cwd, args: ["branch", branchName] });
      return ActionFlags.RefreshItems;
    },
    rename: async ({ denops, items }) => {
      const { cwd, refName } = items[0].action as ActionData;
      const branchName = await fn.input(
        denops,
        `Rename branch name ${refName.branch} => `,
        refName.branch,
      );
      await pipe(denops, "git", {
        cwd,
        args: ["branch", "-m", refName.branch, branchName],
      });
      return ActionFlags.RefreshItems;
    },
  };
  params(): Params {
    return {};
  }
}
