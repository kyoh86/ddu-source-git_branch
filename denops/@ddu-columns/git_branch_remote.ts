import type {
  ItemHighlight,
} from "https://deno.land/x/ddu_vim@v3.9.0/types.ts";
import { ActionData } from "../@ddu-kinds/git_branch.ts";
import { GitBranchBaseColumn } from "./git_branch_base.ts";
import type { Denops } from "https://deno.land/x/denops_std@v5.2.0/mod.ts";
import { strwidth } from "https://deno.land/x/denops_std@v5.2.0/function/mod.ts";

export class Column extends GitBranchBaseColumn {
  override async getAttr(denops: Denops, { refName }: ActionData): Promise<{
    rawText: string;
    highlights?: ItemHighlight[];
  }> {
    const rawText = refName.remote == "" ? "local" : refName.remote;
    return {
      rawText,
      highlights: [{
        col: 0,
        width: await strwidth(denops, rawText),
        hl_group: `dduColumnGitBranch${
          refName.remote == "" ? "Local" : "Remote"
        }`,
        name: `dduColumnGitBranchRemote0`,
      }],
    };
  }
}
