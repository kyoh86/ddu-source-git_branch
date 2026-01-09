import type { ItemHighlight } from "@shougo/ddu-vim/types";
import type { ActionData } from "../../@ddu-kinds/git_branch/main.ts";
import { GitBranchBaseColumn } from "../git_branch_base/main.ts";
import type { Denops } from "@denops/std";
import { strwidth } from "@denops/std/function";

export class Column extends GitBranchBaseColumn {
  override async getAttr(denops: Denops, { upstream }: ActionData): Promise<{
    rawText: string;
    highlights?: ItemHighlight[];
  }> {
    const rawText = upstream.remote == ""
      ? upstream.branch + " "
      : `${upstream.remote}/${upstream.branch}` + " ";
    return {
      rawText,
      highlights: [{
        col: 0,
        width: await strwidth(denops, rawText) + 1,
        hl_group: `dduColumnGitBranchUpstream`,
        name: `dduColumnGitBranchUpstream0`,
      }],
    };
  }

  override getBaseText(): string {
    return "upstream-remote/upstream-branch ";
  }
}
