import { authedProcedure, t } from '../utils'
import { z } from 'zod'

export const stationRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    const stations = await ctx.prisma.station.findMany({
      include: {
        stops: true,
      },
    })

    const userId = ctx.session?.user?.id
    if (!userId) {
      return stations.map(({ name, stops }) => ({
        name,
        stops: stops.map((stop) => stop.id),
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

    const favorites = new Set(user.favorites.map((fav) => fav.stationName))

    return stations.map(({ name, stops }) => ({
      name,
      stops: stops.map((stop) => stop.id),
      isFavorite: favorites.has(name),
    }))
  }),
  getByStationName: t.procedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const station = await ctx.prisma.station.findFirst({
        where: {
          name: {
            equals: input,
          },
        },
        include: {
          stops: true,
        },
      })
      if (!station) {
        throw new Error('TODO')
      }
      const userId = ctx.session?.user?.id
      if (!userId) {
        return { name: input, stops: station.stops.map((stop) => stop.id) }
      }
      const isFavorite = await ctx.prisma.favorite.findFirst({
        where: {
          userId: {
            equals: userId,
          },
          stationName: {
            equals: input,
          },
        },
      })

      return {
        name: input,
        stops: station.stops.map((stop) => stop.id),
        isFavorite: !!isFavorite,
      }
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
          stationName: input,
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
      await ctx.prisma.favorite.delete({
        where: {
          stationName_userId: {
            stationName: input,
            userId,
          },
        },
      })
    }),
})
