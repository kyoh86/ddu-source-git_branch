import type { GatherArguments } from "https://deno.land/x/ddu_vim@v3.9.0/base/source.ts";
import { fn } from "https://deno.land/x/ddu_vim@v3.9.0/deps.ts";
import { treePath2Filename } from "https://deno.land/x/ddu_vim@v3.9.0/utils.ts";
import { BaseSource, Item } from "https://deno.land/x/ddu_vim@v3.9.0/types.ts";
import { TextLineStream } from "https://deno.land/std@0.210.0/streams/text_line_stream.ts";
import { ChunkedStream } from "https://deno.land/x/chunked_stream@0.1.2/mod.ts";

import { ActionData, RefName } from "../@ddu-kinds/git_branch.ts";
import { EchomsgStream } from "https://denopkg.com/kyoh86/denops_util@v0.0.1/echomsg_stream.ts";

type Params = {
  remote: boolean;
  local: boolean;
  cwd?: string;
};

// Build a format string for the `git for-each-ref`.
//
// Raw shell sample: `git for-each-ref --omit-empty --format "%(if:notequals=refs/stash)%(refname:rstrip=-2)%(then)%(if:notequals=refs/tags)%(refname:rstrip=-2)%(then)%(if:notequals=HEAD)%(refname:lstrip=3)%(then)%(HEAD)%00%(refname:lstrip=1)%00%(if)%(upstream)%(then)%(upstream:lstrip=1)%(end)%00%(authorname)%00%(committerdate:format-local:%Y/%m/%d %H:%M:%S)%(end)%(end)%(end)"`
//
// Shell output example: (in fact, it returns null-separated fields)
// * main        origin/main kyoh86 2023/07/25 00:28:04
//   origin/main             kyoh86 2023/07/25 00:28:04
function formatRef(): string {
  return [
    /*   Exclude stash refs */
    /**/ "%(if:notequals=refs/stash)%(refname:rstrip=-2)%(then)",
    /*     Exclude tag refs */
    /*  */ "%(if:notequals=refs/tags)%(refname:rstrip=-2)%(then)",
    /*       Exclude HEAD ref */
    /*    */ "%(if:notequals=HEAD)%(refname:lstrip=3)%(then)",
    /*         Put HEAD mark (* or empty) */
    /*      */ "%(HEAD)%00",
    /*         Put name (like "remotes/origin/main" "heads/main") */
    /*      */ "%(refname:lstrip=1)%00",
    /*      */ "%(if)%(upstream)%(then)",
    /*           Put the upstream name if it exists (like "remotes/origin/main") */
    /*        */ "%(upstream:lstrip=1)",
    /*      */ "%(end)%00",
    /*         Put the last commit author name */
    /*      */ "%(authorname)%00",
    /*         Put the last commit date */
    /*      */ "%(committerdate:format-local:%Y/%m/%d %H:%M:%S)",
    /*    */ "%(end)",
    /*  */ "%(end)",
    /**/ "%(end)",
  ].join("");
}

function parseRefName(rawName: string): RefName {
  const [typ, ...remain] = rawName.split("/");
  if (typ == "remotes") {
    return {
      remote: remain[0],
      branch: remain.slice(1).join("/"),
    };
  }
  return {
    remote: "",
    branch: remain.join("/"),
  };
}

function flatMapRefs(
  rawRefs: string[],
  params: Params,
  cwd: string,
): Item<ActionData>[] {
  return rawRefs.flatMap((rawRef) => {
    const item = parseRef(rawRef, cwd);
    const isRemote = item.action!.refName.remote != "";
    return params.local && !isRemote || params.remote && isRemote ? item : [];
  });
}

function parseRef(rawRef: string, cwd: string): Item<ActionData> {
  const [head, name, upstream, author, date] = rawRef.split("\x00");
  const refName = parseRefName(name);
  return {
    word: refName.branch,
    action: {
      isHead: head == "*",
      refName,
      upstream: parseRefName(upstream),
      author,
      date,
      cwd,
    },
  };
}

export class Source extends BaseSource<Params, ActionData> {
  override kind = "git_branch";

  override gather(
    { denops, sourceOptions, sourceParams }: GatherArguments<Params>,
  ) {
    return new ReadableStream<Item<ActionData>[]>({
      async start(controller) {
        const path = treePath2Filename(sourceOptions.path);
        if (sourceParams.cwd) {
          console.error(
            `WARN: "cwd" for ddu-source-git_branch is deprecated. Use sourceOptions.path instead.`,
          );
        }
        const cwd = sourceParams.cwd ??
          (path && path !== "" ? path : await fn.getcwd(denops));
        const { status, stderr, stdout } = new Deno.Command("git", {
          args: [
            "for-each-ref",
            "--omit-empty",
            "--format",
            formatRef(),
          ],
          cwd,
          stdin: "null",
          stderr: "piped",
          stdout: "piped",
        }).spawn();
        status.then((stat) => {
          if (!stat.success) {
            stderr
              .pipeThrough(new TextDecoderStream())
              .pipeThrough(new TextLineStream())
              .pipeTo(new EchomsgStream(denops, "ErrorMsg"));
          }
        });
        stdout
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new TextLineStream())
          .pipeThrough(new ChunkedStream({ chunkSize: 1000 }))
          .pipeTo(
            new WritableStream<string[]>({
              write: (refs: string[]) => {
                controller.enqueue(
                  flatMapRefs(refs, sourceParams, cwd),
                );
              },
            }),
          ).finally(() => {
            controller.close();
          });
      },
    });
  }

  override params(): Params {
    return { remote: false, local: true };
  }
}
