import { ActionData } from "../@ddu-kinds/git_branch.ts";
import {
  GetTextArguments,
  GetTextResult,
} from "https://deno.land/x/ddu_vim@v4.1.0/base/column.ts";
import { BaseColumn } from "https://deno.land/x/ddu_vim@v4.1.0/types.ts";

type Params = Record<PropertyKey, never>;

export class Column extends BaseColumn<Params> {
  override getLength(): Promise<number> {
    return Promise.resolve(1);
  }

  override getText(
    { item, startCol }: GetTextArguments<Params>,
  ): Promise<GetTextResult> {
    const action = item?.action as ActionData;
    return Promise.resolve({
      text: action.isHead ? "* " : "  ",
      highlights: [{
        name: "dduColumnGitBranchHead0",
        hl_group: "dduColumnGitBranchHead",
        col: startCol,
        width: 2,
      }],
    });
  }

  override getBaseText(): string {
    return "  ";
  }

  override params(): Params {
    return {};
  }
}
