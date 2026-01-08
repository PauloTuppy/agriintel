import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  isAlgoliaAdminConfigured, 
  configureIndices, 
  seedInitialData,
  indexMarketPrices 
} from "./algoliaAdmin";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Algolia admin routes (protected - admin only)
  algolia: router({
    // Check if Algolia is configured
    status: publicProcedure.query(() => {
      return {
        configured: isAlgoliaAdminConfigured(),
        appId: process.env.ALGOLIA_APP_ID ? '***' + process.env.ALGOLIA_APP_ID.slice(-4) : null,
      };
    }),

    // Initialize indices with settings and seed data
    initialize: protectedProcedure.mutation(async () => {
      if (!isAlgoliaAdminConfigured()) {
        throw new Error('Algolia admin not configured. Please set ALGOLIA_APP_ID and ALGOLIA_WRITE_KEY.');
      }
      
      await configureIndices();
      await seedInitialData();
      
      return { success: true, message: 'Algolia indices initialized and seeded.' };
    }),

    // Sync market prices (can be called by scheduled job)
    syncMarketPrices: protectedProcedure
      .input(z.object({
        prices: z.array(z.object({
          region: z.string(),
          crop: z.string(),
          price: z.number(),
          unit: z.string(),
          demand_index: z.number(),
          date: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        if (!isAlgoliaAdminConfigured()) {
          throw new Error('Algolia admin not configured.');
        }
        
        await indexMarketPrices(input.prices);
        return { success: true, indexed: input.prices.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
