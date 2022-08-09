import { createSSGHelpers } from '@trpc/react/ssg'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { trpc } from '../utils/trpc'
import { FC, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { appRouter } from '../server/trpc/router'
import superjson from 'superjson'
import FavoriteToggle from '../components/FavoriteToggle'
import Header from '../components/Header'
import { useSession } from 'next-auth/react'
import { useDebounce } from 'use-debounce'
import ViewportList from 'react-viewport-list'
import { createContext } from '../server/trpc/context'
import Nav from '../components/Nav'
import Spinner from '../components/Spinner'

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext({ req, res } as any),
    transformer: superjson,
  })

  await ssg.fetchQuery('station.getAll')

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  }
}

const Station: FC<{
  station: { name: string; stops: number[]; isFavorite?: boolean }
}> = ({ station }) => {
  return (
    <div className='flex gap-2 items-center justify-between'>
      <Link href={`/stations/${station.name}`} passHref>
        <a>{station.name}</a>
      </Link>
      <FavoriteToggle
        stationName={station.name}
        isFavorite={station.isFavorite}
      />
    </div>
  )
}

const Stations: FC<{
  stations: { name: string; stops: number[]; isFavorite?: boolean }[]
  onlyFavorites?: boolean
}> = ({ stations, onlyFavorites = false }) => {
  const ref = useRef(null)
  const included = useMemo(
    () => stations.filter(({ isFavorite }) => !onlyFavorites || isFavorite),
    [stations, onlyFavorites]
  )
  return (
    <div className='scroll-container' ref={ref}>
      <ViewportList
        viewportRef={ref}
        items={included}
        itemMinSize={24}
        margin={16}
      >
        {(station) => (
          <div key={station.name} className='mb-4'>
            <Station station={station} />
          </div>
        )}
      </ViewportList>
    </div>
  )
}

const Home: NextPage = () => {
  const session = useSession()
  const { data: stations } = trpc.proxy.station.getAll.useQuery()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300)
  const filteredStations = useMemo(() => {
    const normalizedSearchQuery = debouncedSearchQuery.toLowerCase()
    return stations?.filter((station) =>
      station.name.toLowerCase().includes(normalizedSearchQuery)
    )
  }, [stations, debouncedSearchQuery])
  return (
    <>
      <Head>
        <title>WienerTime</title>
        <meta
          name='description'
          content='Real-time traffic data of Wiener Linien monitors.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='min-h-screen pb-[50px] flex flex-col'>
        <Header />
        {!stations && <Spinner />}
        {stations && (
          <main className='flex-1 flex flex-col md:flex-row md:justify-center items-center md:items-start px-4 mt-4 gap-8 md:gap-16'>
            {session.data && (
              <div className='w-full md:w-1/4 md:max-w-sm'>
                <h1 className='text-3xl font-bold mb-4'>Favorites</h1>
                <Stations stations={stations} onlyFavorites />
              </div>
            )}
            <div className='w-full md:w-3/4 md:justify-center md:max-w-sm'>
              <div className='flex gap-4 justify-between items-center mb-4'>
                <h1 className='text-3xl font-bold'>All</h1>
                <input
                  type='text'
                  className='bg-gray-100 px-2 py-1 rounded border border-gray-300'
                  value={searchQuery}
                  placeholder='Search'
                  onChange={(event) =>
                    setSearchQuery(event.currentTarget.value)
                  }
                />
              </div>
              <Stations stations={filteredStations ?? []} />
            </div>
          </main>
        )}
        <Nav />
      </div>
    </>
  )
}

export default Home
