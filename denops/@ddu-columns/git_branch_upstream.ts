import type {
  ItemHighlight,
} from "https://deno.land/x/ddu_vim@v3.9.0/types.ts";
import { ActionData } from "../@ddu-kinds/git_branch.ts";
import { GitBranchBaseColumn } from "./git_branch_base.ts";
import type { Denops } from "https://deno.land/x/denops_std@v5.2.0/mod.ts";
import { strwidth } from "https://deno.land/x/denops_std@v5.2.0/function/mod.ts";

export class Column extends GitBranchBaseColumn {
  override async getAttr(denops: Denops, { upstream }: ActionData): Promise<{
    rawText: string;
    highlights?: ItemHighlight[];
  }> {
    const rawText = upstream.remote == ""
      ? upstream.branch
      : `${upstream.remote}/${upstream.branch}`;
    return {
      rawText,
      highlights: [{
        col: 0,
        width: await strwidth(denops, rawText),
        hl_group: `dduColumnGitBranchUpstream`,
        name: `dduColumnGitBranchUpstream0`,
      }],
    };
  }
}
