import { authedProcedure, t } from '../utils'
import { z } from 'zod'
import lib from '../../../lib'
import { TRPCError } from '@trpc/server'

export const stationRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    const raw = await lib.fetchStaticStopData()
    const userId = ctx.session?.user?.id
    if (!userId) {
      return Object.entries(raw).map(([name, stops]) => ({
        name,
        stops: stops.map((stop) => stop.StopID),
      }))
    }

    const user = await ctx.prisma.user.findFirstOrThrow({
      select: {
        favorites: true,
      },
      where: {
        id: {
          equals: userId,
        },
      },
    })

    const favorites = new Set(user.favorites.map(({ name }) => name))

    return Object.entries(raw).map(([name, stops]) => ({
      name,
      stops: stops.map((stop) => stop.StopID),
      isFavorite: favorites.has(name),
    }))
  }),
  getByName: t.procedure
    .input(z.object({ stationName: z.string() }))
    .query(async ({ ctx, input }) => {
      const stops = (await lib.fetchStaticStopData())[input.stationName]
      if (!stops) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Unknown Station' })
      }
      const userId = ctx.session?.user?.id
      if (!userId) {
        return { name: input, stops: stops.map((stop) => stop.StopID) }
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
            equals: input.stationName,
          },
        },
      })

      return {
        name: input,
        stops: stops.map((stop) => stop.StopID),
        isFavorite: !!isFavorite,
      }
    }),
})
