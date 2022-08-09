import { authedProcedure, t } from '../utils'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const favoriteRouter = t.router({
  add: authedProcedure
    .input(z.object({ stationName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      if (!userId) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      await ctx.prisma.favorite.create({
        data: {
          name: input.stationName,
          userId,
        },
      })
    }),
  remove: authedProcedure
    .input(z.object({ stationName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      if (!userId) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      await ctx.prisma.favorite.delete({
        where: {
          name_userId: {
            name: input.stationName,
            userId,
          },
        },
      })
    }),
})
