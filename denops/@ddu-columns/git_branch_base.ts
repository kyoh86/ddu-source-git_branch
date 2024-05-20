import {
  BaseColumn,
  type DduItem,
  type ItemHighlight,
} from "https://deno.land/x/ddu_vim@v4.1.0/types.ts";
import {
  GetTextArguments,
  GetTextResult,
} from "https://deno.land/x/ddu_vim@v4.1.0/base/column.ts";
import { Denops, fn } from "https://deno.land/x/ddu_vim@v4.1.0/deps.ts";
import { ActionData } from "../@ddu-kinds/git_branch.ts";

type Params = {
  limitLength: number;
};

export abstract class GitBranchBaseColumn extends BaseColumn<Params> {
  #width = 1;

  abstract getAttr(denops: Denops, {}: ActionData): Promise<{
    rawText: string;
    highlights?: ItemHighlight[];
  }>;

  override async getLength(args: {
    denops: Denops;
    columnParams: Params;
    items: DduItem[];
  }): Promise<number> {
    const widths = await Promise.all(args.items.map(
      async (item) => {
        const action = item?.action as ActionData;

        return await fn.strwidth(
          args.denops,
          (await this.getAttr(args.denops, action)).rawText,
        );
      },
    ));
    let width = Math.max(...widths, this.#width);
    if (args.columnParams.limitLength) {
      width = Math.min(width, args.columnParams.limitLength);
    }
    this.#width = width;
    return Promise.resolve(width);
  }

  override async getText(
    { denops, item, startCol }: GetTextArguments<Params>,
  ): Promise<GetTextResult> {
    const action = item?.action as ActionData;
    const attr = await this.getAttr(denops, action);
    const padding = " ".repeat(Math.max(this.#width - attr.rawText.length, 0));
    return {
      text: attr.rawText + padding,
      highlights: attr.highlights?.map((hl) => {
        return { ...hl, col: hl.col + startCol };
      }),
    };
  }

  override params(): Params {
    return { limitLength: 0 };
  }
}
