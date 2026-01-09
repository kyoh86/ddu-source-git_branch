import type { ItemHighlight } from "@shougo/ddu-vim/types";
import type { ActionData } from "../../@ddu-kinds/git_branch/main.ts";
import { GitBranchBaseColumn } from "../git_branch_base/main.ts";
import type { Denops } from "@denops/std";
import { strwidth } from "@denops/std/function";

export class Column extends GitBranchBaseColumn {
  override async getAttr(denops: Denops, { refName }: ActionData): Promise<{
    rawText: string;
    highlights?: ItemHighlight[];
  }> {
    const rawText = refName.remote == "" ? "local " : refName.remote + " ";
    return {
      rawText,
      highlights: [{
        col: 0,
        width: await strwidth(denops, rawText) + 1,
        hl_group: `dduColumnGitBranch${
          refName.remote == "" ? "Local" : "Remote"
        }`,
        name: `dduColumnGitBranchRemote0`,
      }],
    };
  }

  override getBaseText(): string {
    return "remote ";
  }
}
