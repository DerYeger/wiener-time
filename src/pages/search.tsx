import { createSSGHelpers } from '@trpc/react/ssg'
import { GetServerSideProps, NextPage } from 'next'
import superjson from 'superjson'
import { appRouter } from '../server/trpc/router'
import { createContext } from '../server/trpc/context'
import Head from 'next/head'
import { useState, useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { Stations } from '.'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Spinner from '../components/Spinner'
import { trpc } from '../utils/trpc'

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext({ req, res } as any),
    transformer: superjson,
  })

  await ssg.fetchQuery('station.getAll')

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  }
}

const SearchPage: NextPage = () => {
  const { data: stations } = trpc.proxy.station.getAll.useQuery()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300)
  const { data: favorites } = trpc.proxy.favorite.getAll.useQuery()
  const mappedStations = useMemo(
    () =>
      stations?.map((station) => ({
        ...station,
        isFavorite: favorites?.has(station.name),
      })),
    [stations, favorites]
  )
  const filteredStations = useMemo(() => {
    const normalizedSearchQuery = debouncedSearchQuery.toLowerCase()
    return mappedStations?.filter((station) =>
      station.name.toLowerCase().includes(normalizedSearchQuery)
    )
  }, [mappedStations, debouncedSearchQuery])

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
        {!mappedStations && <Spinner />}
        {mappedStations && (
          <main className='flex-1 flex flex-col px-4 mt-4 items-center'>
            <div className='w-full max-w-md'>
              <div className='flex gap-4 justify-between items-center mb-4'>
                <h1 className='text-3xl font-bold'>All</h1>
                <input
                  type='text'
                  className='bg-gray-100 px-2 py-1 rounded border border-gray-300 min-w-0'
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

export default SearchPage
