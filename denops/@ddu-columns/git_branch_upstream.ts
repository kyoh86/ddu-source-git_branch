import type { ItemHighlight } from "jsr:@shougo/ddu-vim@~10.0.0/types";
import type { ActionData } from "../@ddu-kinds/git_branch.ts";
import { GitBranchBaseColumn } from "./git_branch_base.ts";
import type { Denops } from "jsr:@denops/std@~7.4.0";
import { strwidth } from "jsr:@denops/std@~7.4.0/function";

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
