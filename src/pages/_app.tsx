// src/pages/_app.tsx
import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import type { AppType } from 'next/dist/shared/lib/utils'
import { trpc } from '../utils/trpc'
import 'mapbox-gl/dist/mapbox-gl.css'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default trpc.withTRPC(MyApp)
