import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { getDbClient } from "@/lib/db/models";
import { gethelpersClient } from "@/lib/db/helpers";
import { ENVIRONMENTS } from "@/config";

export const environmentRouter = router({
  getAvailable: privateProcedure
    .input(z.object({ owner: z.string(), repo: z.string(), projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { accessToken } = ctx.session;
      const { owner, repo, projectId } = input;

      const helpers = await gethelpersClient();

      return (
        await Promise.all(
          ENVIRONMENTS.map(async (env) => {
            const hasUnusedPaths =
              (await helpers.github.getPaths(owner, repo, accessToken!, projectId, env.value))
                .length > 0;

            return hasUnusedPaths ? env : null;
          })
        )
      ).filter(Boolean);
    }),
});
