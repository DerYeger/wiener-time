import { t } from '../utils'
import { z } from 'zod'
import lib from '../../../lib'

export const monitorRouter = t.router({
  getByStopIds: t.procedure
    .input(z.array(z.number()))
    .query(async ({ input }) => {
      return await lib.fetchMonitorData(input)
    }),
})
