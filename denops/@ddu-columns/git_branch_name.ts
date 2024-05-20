import type {
  ItemHighlight,
} from "https://deno.land/x/ddu_vim@v4.1.0/types.ts";
import { ActionData } from "../@ddu-kinds/git_branch.ts";
import { GitBranchBaseColumn } from "./git_branch_base.ts";
import type { Denops } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import { strwidth } from "https://deno.land/x/denops_std@v6.5.0/function/mod.ts";

export class Column extends GitBranchBaseColumn {
  override async getAttr(denops: Denops, { refName }: ActionData): Promise<{
    rawText: string;
    highlights?: ItemHighlight[];
  }> {
    const rawText = refName.branch + " ";
    return {
      rawText,
      highlights: [{
        col: 0,
        width: await strwidth(denops, rawText) + 1,
        hl_group: `dduColumnGitBranchName`,
        name: `dduColumnGitBranchName0`,
      }],
    };
  }

  override getBaseText(): string {
    return "branch ";
  }
}
