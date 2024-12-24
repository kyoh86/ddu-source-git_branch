import type { ItemHighlight } from "jsr:@shougo/ddu-vim@~9.2.0/types";
import type { ActionData } from "../@ddu-kinds/git_branch.ts";
import { GitBranchBaseColumn } from "./git_branch_base.ts";
import type { Denops } from "jsr:@denops/std@~7.4.0";
import { strwidth } from "jsr:@denops/std@~7.4.0/function";

export class Column extends GitBranchBaseColumn {
  override async getAttr(denops: Denops, { author }: ActionData): Promise<{
    rawText: string;
    highlights?: ItemHighlight[];
  }> {
    const rawText = author + " ";
    return {
      rawText,
      highlights: [{
        col: 0,
        width: await strwidth(denops, rawText) + 1,
        hl_group: `dduColumnGitBranchAuthor`,
        name: `dduColumnGitBranchAuthor0`,
      }],
    };
  }
  override getBaseText(): string {
    return "author <author@example.com>";
  }
}
