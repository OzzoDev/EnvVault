import { getDbClient } from "@/lib/db/models";
import { privateProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const projectRouter = router({
  get: privateProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const { id: githubId } = user;

    const db = await getDbClient();

    return await db.project.getByProfile(githubId);
  }),
  getById: privateProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { projectId } = input;
      const { user } = ctx;
      const { id: githubId } = user;

      const db = await getDbClient();
      const project = await db.project.getById(projectId, githubId);

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project with id ${projectId} not found or access denied`,
        });
      }

      return project;
    }),
  create: privateProcedure
    .input(
      z.object({
        repo_id: z.number(),
        name: z.string(),
        full_name: z.string(),
        owner: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { repo_id, name, full_name, owner, url } = input;

      const { user } = ctx;
      const { id: github_id } = user;

      const db = await getDbClient();

      const profile = await db.profile.getByField({ github_id: github_id.toString() });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const project = await db.project.create(
        { profile_id: profile.id, repo_id, name, full_name, owner, url },
        process.env.ENCRYPTION_ROOT_KEY!
      );

      return project;
    }),
  delete: privateProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input }) => {
      const { projectId } = input;
      const db = await getDbClient();

      return await db.project.delete(projectId);
    }),
});
