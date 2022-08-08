import { Icon } from '@iconify/react'
import { createSSGHelpers } from '@trpc/react/ssg'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { FC } from 'react'
import FavoriteToggle from '../../components/FavoriteToggle'
import Spinner from '../../components/Spinner'
import { Departure, Line, Monitor } from '../../model'
import { appRouter } from '../../server/trpc/router'
import { trpc } from '../../utils/trpc'
import superjson from 'superjson'
import Head from 'next/head'
import Header from '../../components/Header'

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log('prefetching')

  const name = context.query.name as string
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: context as any,
    transformer: superjson,
  })

  await ssg.fetchQuery('station.getByStationName', name)

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  }
}

const DepartureListItem: FC<{ departure: Departure }> = ({ departure }) => {
  let delay = 0
  if (departure.departureTime.timePlanned && departure.departureTime.timeReal) {
    const planned = new Date(departure.departureTime.timePlanned).getTime()
    const expected = new Date(departure.departureTime.timeReal).getTime()
    delay = Math.ceil((expected - planned) / 1000 / 60)
  }

  const departureTime = () => {
    if (departure.departureTime.countdown === 0) {
      return <span>Now</span>
    }
    if (departure.departureTime.countdown === undefined) {
      return <></>
    }
    return <span>{departure.departureTime.countdown} minutes</span>
  }

  return (
    <div className='flex justify-between items-center h-[40px]'>
      <div className='flex flex-col'>
        {departureTime()}
        {delay !== 0 && (
          <span
            className='text-xs'
            style={{ color: delay > 0 ? 'red' : 'orange' }}
          >
            {Math.abs(delay)} minute(s) {delay > 0 ? 'late' : 'early'}
          </span>
        )}
      </div>
      {departure.vehicle?.barrierFree && <Icon icon='fa:wheelchair' />}
    </div>
  )
}

const LineComponent: FC<{ line: Line; maxDepartures?: number }> = ({
  line,
  maxDepartures = 4,
}) => {
  return (
    <div className='border-2 p-4 rounded'>
      <h1 className='font-bold'>
        {line.name} - {line.towards}
      </h1>
      <hr className='my-2' />
      <div className='flex flex-col gap-2'>
        {line.departures?.departure
          .slice(0, maxDepartures)
          .map((departure, index) => (
            <DepartureListItem departure={departure} key={index} />
          ))}
      </div>
    </div>
  )
}

const MonitorComponent: FC<{ monitor: Monitor }> = ({ monitor }) => {
  return (
    <div className='flex flex-col w-full sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6 m-2'>
      {monitor.lines.map((line) => (
        <LineComponent line={line} key={line.lineId} />
      ))}
    </div>
  )
}

const StationPage: NextPage = () => {
  const router = useRouter()
  const name = router.query.name as string
  const { data: station } = trpc.proxy.station.getByStationName.useQuery(name)
  const { data: monitors } = trpc.proxy.monitor.getByStopIds.useQuery(
    station?.stops ?? [],
    {
      refetchInterval: 30 * 1000,
    }
  )
  return (
    <>
      <Head>
        <title>{name} - WienerTime</title>
        <meta
          name='description'
          content='Real-time traffic data of Wiener Linien monitors.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Header />
      <div>
        <div className='flex items-center justify-between my-8 mx-4'>
          <h1 className='text-center text-5xl'>{name}</h1>
          <FavoriteToggle stationName={name} isFavorite={station?.isFavorite} />
        </div>
        <div className='flex flex-wrap justify-center m-2'>
          {!monitors && <Spinner />}
          {monitors?.length === 0 && <span>No data</span>}
          {monitors?.map((monitor, index) => (
            <MonitorComponent key={index} monitor={monitor} />
          ))}
        </div>
      </div>
    </>
  )
}

export default StationPage
