import type { ActionData } from "../@ddu-kinds/git_branch.ts";
import {
  BaseColumn,
  type GetTextArguments,
  type GetTextResult,
} from "jsr:@shougo/ddu-vim@~9.4.0/column";

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
