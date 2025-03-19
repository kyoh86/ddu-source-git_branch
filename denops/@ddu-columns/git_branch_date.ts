import type { ItemHighlight } from "jsr:@shougo/ddu-vim@~10.3.0/types";
import type { ActionData } from "../@ddu-kinds/git_branch.ts";
import { GitBranchBaseColumn } from "./git_branch_base.ts";
import type { Denops } from "jsr:@denops/std@~7.5.0";
import { strwidth } from "jsr:@denops/std@~7.5.0/function";

export class Column extends GitBranchBaseColumn {
  override async getAttr(denops: Denops, { date }: ActionData): Promise<{
    rawText: string;
    highlights?: ItemHighlight[];
  }> {
    const rawText = date + " ";
    return {
      rawText,
      highlights: [{
        col: 0,
        width: await strwidth(denops, rawText) + 1,
        hl_group: `dduColumnGitBranchDate`,
        name: `dduColumnGitBranchDate0`,
      }],
    };
  }
  override getBaseText(): string {
    return "yyyy-mm-dd ";
  }
}
