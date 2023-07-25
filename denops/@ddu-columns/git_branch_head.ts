import { ActionData } from "../@ddu-kinds/git_branch.ts";
import {
  GetTextArguments,
  GetTextResult,
} from "https://deno.land/x/ddu_vim@v3.4.2/base/column.ts";
import { BaseColumn } from "https://deno.land/x/ddu_vim@v3.4.2/types.ts";

type Params = Record<never, never>;

export class Column extends BaseColumn<Params> {
  override getLength(): Promise<number> {
    return Promise.resolve(1);
  }

  override getText(
    { item, startCol }: GetTextArguments<Params>,
  ): Promise<GetTextResult> {
    const action = item?.action as ActionData;
    return Promise.resolve({
      text: action.isHead ? "*" : " ",
      highlights: [{
        name: "dduColumnGitBranchHead0",
        hl_group: "dduColumnGitBranchHead",
        col: startCol,
        width: 1,
      }],
    });
  }

  override params(): Params {
    return {};
  }
}
