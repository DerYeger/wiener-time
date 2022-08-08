import { createSSGHelpers } from '@trpc/react/ssg'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { trpc } from '../utils/trpc'
import { FC, useMemo, useState } from 'react'
import Link from 'next/link'
import { appRouter } from '../server/trpc/router'
import superjson from 'superjson'
import FavoriteToggle from '../components/FavoriteToggle'
import Header from '../components/Header'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: context as any,
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
      <Link href={`/stations/${station.name}`}>{station.name}</Link>
      {station.isFavorite !== undefined && (
        <FavoriteToggle
          stationName={station.name}
          isFavorite={station.isFavorite}
        />
      )}
    </div>
  )
}

const Stations: FC<{
  stations: { name: string; stops: number[]; isFavorite?: boolean }[]
  onlyFavorites?: boolean
}> = ({ stations, onlyFavorites = false }) => {
  return (
    <div className='flex flex-col gap-4'>
      {stations
        .filter(({ isFavorite }) => !onlyFavorites || isFavorite)
        .map((station) => (
          <Station key={station.name} station={station} />
        ))}
    </div>
  )
}

const Home: NextPage = () => {
  const { data: stations } = trpc.proxy.station.getAll.useQuery()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const filteredStations = useMemo(() => {
    const normalizedSearchQuery = searchQuery.toLowerCase()
    return stations?.filter((station) =>
      station.name.toLowerCase().includes(normalizedSearchQuery)
    )
  }, [stations, searchQuery])
  if (!stations) {
    return <span>Loading</span>
  }
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
      <Header />
      <main className='container flex flex-col items-center min-h-screen px-4 my-4 mx-auto gap-8'>
        <div className='w-full max-w-md'>
          <h1 className='text-2xl font-bold mb-4'>Favorites</h1>
          <Stations stations={stations} onlyFavorites />
        </div>
        <div className='w-full max-w-md'>
          <div className='flex gap-2 justify-between items-center  mb-4'>
            <h1 className='text-2xl font-bold'>All</h1>
            <input
              type='text'
              className='bg-gray-100 px-2 py-1 rounded border border-gray-300'
              value={searchQuery}
              placeholder='Search'
              onInput={(event) => setSearchQuery(event.currentTarget.value)}
            />
          </div>
          <Stations stations={filteredStations ?? []} />
        </div>
      </main>
    </>
  )
}

export default Home
