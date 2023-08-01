import {
  ActionFlags,
  BaseKind,
} from "https://deno.land/x/ddu_vim@v3.4.4/types.ts";
import type {
  Actions,
  DduItem,
} from "https://deno.land/x/ddu_vim@v3.4.4/types.ts";
import type { Denops } from "https://deno.land/x/ddu_vim@v3.4.4/deps.ts";
import { fn } from "https://deno.land/x/ddu_vim@v3.4.4/deps.ts";
import { passthrough } from "../ddu-source-git_branch/message.ts";

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

async function callGit(
  denops: Denops,
  cwd: string,
  args: string[],
) {
  await passthrough(
    denops,
    new Deno.Command("git", {
      args,
      cwd: cwd,
      stdin: "null",
      stderr: "piped",
      stdout: "piped",
    }).spawn(),
  );
}

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
        await callGit(denops, cwd, ["switch", refName.branch]);
        return ActionFlags.None;
      }
      await callGit(denops, cwd, [
        "switch",
        "--guess",
        "--track",
        `${refName.remote}/${refName.branch}`,
      ]);
      return ActionFlags.None;
    },
    delete: async ({ denops, items }) => {
      for (const item of items) {
        const { cwd, refName } = item.action as ActionData;
        await callGit(denops, cwd, ["branch", "-d", refName.branch]);
      }
      return ActionFlags.None;
    },
    deleteForce: async ({ denops, items }) => {
      for (const item of items) {
        const { cwd, refName } = item.action as ActionData;
        await callGit(denops, cwd, ["branch", "-D", refName.branch]);
      }
      return ActionFlags.None;
    },
    create: async ({ denops, items }) => {
      const { cwd } = items[0].action as ActionData;
      const branchName = await fn.input(
        denops,
        "Create branch name you entered => ",
      );
      await callGit(denops, cwd, ["branch", branchName]);
      return ActionFlags.RefreshItems;
    },
  };
  params(): Params {
    return {};
  }
}
