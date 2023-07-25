import {
  ActionFlags,
  BaseKind,
} from "https://deno.land/x/ddu_vim@v3.4.2/types.ts";
import type {
  Actions,
  DduItem,
} from "https://deno.land/x/ddu_vim@v3.4.2/types.ts";
import type { Denops } from "https://deno.land/x/ddu_vim@v3.4.2/deps.ts";
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

async function callProcessByBranch(
  denops: Denops,
  items: DduItem[],
  subargs: string[],
) {
  if (items.length != 1) {
    await denops.call(
      "ddu#util#print_error",
      "invalid action calling: it can accept only one item",
      "ddu-source-git_branch",
    );
    return ActionFlags.None;
  }
  const action = items[0].action as ActionData;
  const args = [
    ...subargs,
    action.refName.branch,
  ];
  passthrough(
    denops,
    new Deno.Command("git", {
      args,
      cwd: action.cwd,
      stdin: "null",
      stderr: "piped",
      stdout: "piped",
    }).spawn(),
  );
  return ActionFlags.None;
}

export class Kind extends BaseKind<Params> {
  override actions: Actions<Params> = {
    switch: async ({ denops, items }) => {
      return await callProcessByBranch(denops, items, ["switch"]);
    },
    delete: async ({ denops, items }) => {
      return await callProcessByBranch(denops, items, ["branch", "-d"]);
    },
    deleteForce: async ({ denops, items }) => {
      return await callProcessByBranch(denops, items, ["branch", "-D"]);
    },
  };
  params(): Params {
    return {};
  }
}
