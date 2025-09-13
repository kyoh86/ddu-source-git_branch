import {
  ActionFlags,
  type Actions,
  type DduItem,
  type Previewer,
} from "jsr:@shougo/ddu-vim@~11.1.0/types";
import { BaseKind } from "jsr:@shougo/ddu-vim@~11.1.0/kind";
import type { Denops } from "jsr:@denops/std@~8.0.0";
import * as fn from "jsr:@denops/std@~8.0.0/function";
import { echoallCommand } from "jsr:@kyoh86/denops-util@~0.1.0/command";
import { yank } from "jsr:@kyoh86/denops-util@~0.1.0/yank";
import type { GetPreviewerArguments } from "jsr:@shougo/ddu-vim@~11.1.0/kind";

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

type Params = Record<PropertyKey, never>;

async function ensureOnlyOneItem(denops: Denops, items: DduItem[]) {
  if (items.length != 1) {
    await denops.call(
      "ddu#util#print_error",
      "invalid action calling: it can accept only one item",
      "ddu-kind-git_branch",
    );
    return;
  }
  return items[0];
}

export class Kind extends BaseKind<Params> {
  override actions: Actions<Params> = {
    switch: async ({ denops, items }) => {
      const item = await ensureOnlyOneItem(denops, items);
      if (!item) {
        return ActionFlags.None;
      }
      const { cwd, refName } = item.action as ActionData;
      if (refName.remote == "") {
        await echoallCommand(denops, "git", {
          cwd,
          args: ["switch", refName.branch],
        });
        return ActionFlags.None;
      }
      await echoallCommand(denops, "git", {
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
        await echoallCommand(denops, "git", {
          cwd,
          args: ["branch", "-d", refName.branch],
        });
      }
      return ActionFlags.None;
    },
    deleteForce: async ({ denops, items }) => {
      for (const item of items) {
        const { cwd, refName } = item.action as ActionData;
        await echoallCommand(denops, "git", {
          cwd,
          args: ["branch", "-D", refName.branch],
        });
      }
      return ActionFlags.None;
    },
    yankName: async ({ denops, items }) => {
      const item = await ensureOnlyOneItem(denops, items);
      if (!item) {
        return ActionFlags.None;
      }
      const { refName } = item.action as ActionData;
      const name = refName.remote == ""
        ? refName.branch
        : `${refName.remote}/${refName.branch}`;
      await yank(denops, name);
      return ActionFlags.None;
    },
    createFrom: async ({ denops, items }) => {
      const item = await ensureOnlyOneItem(denops, items);
      if (!item) {
        return ActionFlags.None;
      }
      const { refName, isHead, cwd } = item.action as ActionData;
      const branchName = await fn.input(
        denops,
        "Copy to new branch name you entered => ",
      );
      const args = ["branch", branchName];
      if (!isHead) {
        args.push(
          refName.remote == ""
            ? refName.branch
            : `${refName.remote}/${refName.branch}`,
        );
      }
      await echoallCommand(denops, "git", { cwd, args });
      return ActionFlags.RefreshItems;
    },
    create: async ({ denops, items }) => {
      const item = await ensureOnlyOneItem(denops, items);
      if (!item) {
        return ActionFlags.None;
      }
      const { cwd } = item.action as ActionData;
      const branchName = await fn.input(
        denops,
        "Create branch name you entered => ",
      );
      await echoallCommand(denops, "git", {
        cwd,
        args: ["branch", branchName],
      });
      return ActionFlags.RefreshItems;
    },
    rebaseTo: async ({ denops, items }) => {
      const item = await ensureOnlyOneItem(denops, items);
      if (!item) {
        return ActionFlags.None;
      }
      const { refName, isHead, cwd } = item.action as ActionData;
      if (isHead) {
        await denops.call(
          "ddu#util#print_error",
          "invalid action calling: it cannot rebase to the head branch",
          "ddu-kind-git_branch",
        );
        return ActionFlags.None;
      }
      const args = ["rebase"];
      args.push(
        refName.remote == ""
          ? refName.branch
          : `${refName.remote}/${refName.branch}`,
      );
      await echoallCommand(denops, "git", { cwd, args });
      return ActionFlags.None;
    },
    rename: async ({ denops, items }) => {
      const item = await ensureOnlyOneItem(denops, items);
      if (!item) {
        return ActionFlags.None;
      }
      const { cwd, refName } = item.action as ActionData;
      const branchName = await fn.input(
        denops,
        `Rename branch name ${refName.branch} => `,
        refName.branch,
      );
      await echoallCommand(denops, "git", {
        cwd,
        args: ["branch", "-m", refName.branch, branchName],
      });
      return ActionFlags.RefreshItems;
    },
  };
  params(): Params {
    return {};
  }

  override async getPreviewer({
    item,
  }: GetPreviewerArguments): Promise<Previewer | undefined> {
    const { cwd, refName } = item.action as ActionData;
    return await Promise.resolve({
      kind: "terminal",
      cmds: [
        "git",
        "-C",
        cwd,
        "log",
        refName.remote == ""
          ? refName.branch
          : `${refName.remote}/${refName.branch}`,
      ],
    });
  }
}
