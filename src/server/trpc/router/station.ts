import { t } from '../utils'
import { z } from 'zod'
import lib from '../../../lib'
import { TRPCError } from '@trpc/server'

export const stationRouter = t.router({
  getByName: t.procedure
    .input(z.object({ stationName: z.string() }))
    .query(async ({ input }) => {
      const station = await lib.fetchStationByName(input.stationName)
      if (station.stops.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Unknown Station' })
      }
      return station
    }),
})
