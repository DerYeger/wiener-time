import '../styles/globals.css'
import '../styles/spinner.css'
import { SessionProvider } from 'next-auth/react'
import type { AppType } from 'next/dist/shared/lib/utils'
import { trpc } from '../utils/trpc'
import { DefaultSeo } from 'next-seo'
import SEO from '../seo'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <SessionProvider session={pageProps.session}>
      <DefaultSeo {...SEO} />
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default trpc.withTRPC(MyApp)
