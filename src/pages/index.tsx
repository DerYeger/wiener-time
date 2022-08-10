import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import Head from 'next/head'
import { trpc } from '../utils/trpc'
import { FC, useMemo, useRef } from 'react'
import Link from 'next/link'
import FavoriteToggle from '../components/FavoriteToggle'
import Header from '../components/Header'
import { signIn, useSession } from 'next-auth/react'
import ViewportList from 'react-viewport-list'
import Nav from '../components/Nav'
import Spinner from '../components/Spinner'
import lib from '../lib'
import { Icon } from '@iconify/react'

export const getStaticProps: GetStaticProps<{
  stations: { name: string; stops: number[] }[]
}> = async () => {
  const stations = await lib.fetchAllStations()
  return {
    props: {
      stations,
    },
    revalidate: 86400,
  }
}

export const Station: FC<{
  station: { name: string; stops: number[]; isFavorite?: boolean }
}> = ({ station }) => {
  return (
    <div className='flex gap-2 items-center justify-between'>
      <Link href={`/stations/${lib.encodeStationName(station.name)}`} passHref>
        <a className='text-neutral-700 hover:text-black transition-colors'>
          {station.name}
        </a>
      </Link>
      <FavoriteToggle
        stationName={station.name}
        isFavorite={station.isFavorite}
      />
    </div>
  )
}

export const Stations: FC<{
  stations: { name: string; stops: number[]; isFavorite?: boolean }[]
}> = ({ stations }) => {
  const ref = useRef(null)
  return (
    <div className='scroll-container' ref={ref}>
      <ViewportList
        viewportRef={ref}
        items={stations}
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

const SearchForYourStation: FC = () => {
  return (
    <Link href='/search' passHref>
      <a className='text-neutral-600 hover:text-black transition-colors flex gap-2 items-center justify-center'>
        <Icon icon='fa:train' />
        Search for your station
        <Icon icon='fa:bus' />
      </a>
    </Link>
  )
}

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  stations,
}) => {
  const session = useSession()
  const { data: favorites } = trpc.proxy.favorite.getAll.useQuery()
  const favoriteStations = useMemo(
    () =>
      stations
        ?.map((station) => ({
          ...station,
          isFavorite: favorites?.has(station.name),
        }))
        .filter(({ isFavorite }) => isFavorite),
    [stations, favorites]
  )

  return (
    <>
      <Head>
        <title>WienerTime</title>
        <meta
          name='description'
          content='Real-time traffic data of Wiener Linien monitors.'
        />
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
      </Head>
      <div className='min-h-screen pb-[50px] flex flex-col'>
        <Header />
        <main className='flex-1 flex flex-col px-4 mt-4 items-center justify-between'>
          {!session.data && (
            <>
              <div className='h-[48px]' />
              <div className='text-neutral-500 flex flex-col gap-2 items-center'>
                <div>
                  <button
                    className='text-blue-600 hover:text-blue-700 transition-colors'
                    onClick={() => signIn()}
                  >
                    Sign in to save favorites
                  </button>
                </div>
                <span>or</span>
                <SearchForYourStation />
              </div>
            </>
          )}
          {session.data && !favoriteStations && <Spinner />}
          {session.data && favoriteStations && (
            <div className='w-full max-w-md flex-1 flex flex-col'>
              <h1 className='text-3xl font-bold mb-4'>Favorites</h1>
              <Stations stations={favoriteStations} />
              {favoriteStations.length === 0 && (
                <div className='flex-1 flex items-center justify-center'>
                  <SearchForYourStation />
                </div>
              )}
            </div>
          )}
          <footer className='p-4 text-neutral-400 text-xs'>
            <a
              href='https://github.com/DerYeger/wiener-time'
              target='_blank'
              rel='noreferrer'
              className='flex gap-1 items-center hover:text-neutral-600 transition-colors'
            >
              An open-source project
              <Icon icon='ic:round-open-in-new' />
            </a>
          </footer>
        </main>
        <Nav />
      </div>
    </>
  )
}

export default Home
