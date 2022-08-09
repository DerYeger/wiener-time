import { t } from '../utils'
import { z } from 'zod'
import lib from '../../../lib'
import { TRPCError } from '@trpc/server'

export const stationRouter = t.router({
  getAll: t.procedure.query(async () => {
    const stops = await lib.fetchStaticStopData()
    return Object.entries(stops).map(([name, stops]) => ({
      name,
      stops: stops.map((stop) => stop.StopID),
    }))
  }),
  getByName: t.procedure
    .input(z.object({ stationName: z.string() }))
    .query(async ({ input }) => {
      const stops = (await lib.fetchStaticStopData())[input.stationName]
      if (!stops) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Unknown Station' })
      }
      return {
        name: input,
        stops: stops.map((stop) => stop.StopID),
      }
    }),
})
