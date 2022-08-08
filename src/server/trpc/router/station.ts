import { authedProcedure, t } from '../utils'
import { z } from 'zod'
import lib from '../../../lib'

export const stationRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    const raw = await lib.fetchStaticStopData()
    const userId = ctx.session?.user?.id
    if (!userId) {
      return Object.entries(raw).map(([name, stops]) => ({
        name,
        stops,
      }))
    }
    const favorites = new Set(
      (
        await ctx.prisma.favorite.findMany({
          select: {
            name: true,
          },
          where: {
            userId: {
              equals: userId,
            },
          },
          orderBy: [{ name: 'asc' }],
        })
      ).map(({ name }) => name)
    )

    return Object.entries(raw).map(([name, stops]) => ({
      name,
      stops,
      isFavorite: favorites.has(name),
    }))
  }),
  getByStationName: t.procedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const stops = (await lib.fetchStaticStopData())[input] ?? []
      const userId = ctx.session?.user?.id
      if (!userId) {
        return { name: input, stops }
      }
      const isFavorite = await ctx.prisma.favorite.findFirst({
        select: {
          name: true,
        },
        where: {
          userId: {
            equals: userId,
          },
          name: {
            equals: input,
          },
        },
      })

      return { name: input, stops, isFavorite: !!isFavorite }
    }),
  addFavorite: authedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      if (!userId) {
        return
      }
      await ctx.prisma.favorite.create({
        data: {
          name: input,
          userId,
        },
      })
    }),
  removeFavorite: authedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      if (!userId) {
        return
      }
      await ctx.prisma.favorite.deleteMany({
        where: {
          name: {
            equals: input,
          },
          userId: {
            equals: userId,
          },
        },
      })
    }),
})
