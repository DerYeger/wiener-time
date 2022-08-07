// src/server/trpc/router/index.ts
import { t } from '../utils'
import { stationRouter } from './station'
import { authRouter } from './auth'
import { monitorRouter } from './monitor'

export const appRouter = t.router({
  station: stationRouter,
  monitor: monitorRouter,
  auth: authRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
