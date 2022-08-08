import { createSSGHelpers } from '@trpc/react/ssg'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { signIn, signOut, useSession } from 'next-auth/react'
import { trpc } from '../utils/trpc'
import { FC } from 'react'
import Link from 'next/link'
import { appRouter } from '../server/trpc/router'
import superjson from 'superjson'
import { StaticStopData } from '../model'

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
  station: { name: string; stops: StaticStopData[]; isFavorite: boolean }
}> = ({ station }) => {
  const utils = trpc.useContext()
  const addFavorite = trpc.proxy.station.addFavorite.useMutation({
    onSuccess() {
      utils.invalidateQueries('station.getAll')
    },
  })
  const removeFavorite = trpc.proxy.station.removeFavorite.useMutation({
    onSuccess() {
      utils.invalidateQueries('station.getAll')
    },
  })
  return (
    <div className='flex gap-2 items-center'>
      <Link href={`/stations/${station.name}`}>{station.name}</Link>
      {!station.isFavorite && (
        <button
          onClick={() => addFavorite.mutate(station.name)}
          className='bg-blue-500 rounded px-4 py-2 text-white'
        >
          Fav
        </button>
      )}
      {station.isFavorite && (
        <button
          onClick={() => removeFavorite.mutate(station.name)}
          className='bg-red-500 rounded px-4 py-2 text-white'
        >
          Unfav
        </button>
      )}
    </div>
  )
}

const Stations: FC<{
  stations: { name: string; stops: StaticStopData[]; isFavorite: boolean }[]
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
  const session = useSession()
  const { data: stations } = trpc.proxy.station.getAll.useQuery()
  if (!stations) {
    return <span>Loading</span>
  }
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name='description' content='Generated by create-t3-app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div>
        {session.data && (
          <div className='flex flex-col items-center'>
            <span>Welcome {session.data.user?.name}</span>
            <button onClick={() => signOut()}>Logout</button>
          </div>
        )}
        {!session.data && <button onClick={() => signIn()}>Login</button>}
      </div>
      <main className='container flex flex-col items-center justify-center min-h-screen p-4 mx-auto'>
        <div>
          <h1>Favorites</h1>
          <Stations stations={stations} onlyFavorites />
        </div>
        <div>
          <h1>WienerTime</h1>
          <Stations stations={stations} />
        </div>
      </main>
    </>
  )
}

export default Home
