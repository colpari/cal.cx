import { z } from "zod";

import { authedAdminProcedure } from "@calcom/trpc/server/procedures/authedProcedure";
import publicProcedure from "@calcom/trpc/server/procedures/publicProcedure";
import { router } from "@calcom/trpc/server/trpc";

import { getFeatureFlagMap } from "./utils";

export const featureFlagRouter = router({
  list: publicProcedure
  .meta({ openapi: { method: 'GET', path: '/test-trpc-openapi' } })
  .input(z.void())
  .output(z.array(
      z.object({
        slug: z.string(),
        enabled: z.boolean(),
        description: z.string(),
      }),
    ),
  )
  .query(async ({ ctx }) => {
    const { prisma } = ctx;
    return prisma.feature.findMany({
      orderBy: { slug: "asc" },
    });
  }),
  map: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;
    return getFeatureFlagMap(prisma);
  }),
  toggle: authedAdminProcedure
    .input(z.object({ slug: z.string(), enabled: z.boolean() }))
    .mutation(({ ctx, input }) => {
      const { prisma, user } = ctx;
      const { slug, enabled } = input;
      return prisma.feature.update({
        where: { slug },
        data: { enabled, updatedBy: user.id },
      });
    }),
});
