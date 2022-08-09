import { Icon } from '@iconify/react'
import { createSSGHelpers } from '@trpc/react/ssg'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { FC, useMemo } from 'react'
import FavoriteToggle from '../../components/FavoriteToggle'
import Spinner from '../../components/Spinner'
import { Departure, Line, Monitor } from '../../model'
import { appRouter } from '../../server/trpc/router'
import { trpc } from '../../utils/trpc'
import superjson from 'superjson'
import Head from 'next/head'
import Header from '../../components/Header'
import { createContext } from '../../server/trpc/context'
import lineClasses from '../../lineClasses.json'
import Nav from '../../components/Nav'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const stationName = query.name as string
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext({ req, res } as any),
    transformer: superjson,
  })

  await ssg.fetchQuery('station.getByName', { stationName })

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  }
}

const formatMinutes = (minutes: number) =>
  `${minutes} ${Math.abs(minutes) !== 1 ? 'minutes' : 'minute'}`

const formatDelay = (delay: number) =>
  `${formatMinutes(Math.abs(delay))} ${delay > 0 ? 'late' : 'early'}`

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
    return <span>{formatMinutes(departure.departureTime.countdown)}</span>
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
            {formatDelay(delay)}
          </span>
        )}
      </div>
      <div className='flex gap-2'>
        {departure.vehicle?.realtimeSupported && (
          <Icon icon='fluent:live-24-regular' className='text-green-500' />
        )}
        {departure.vehicle?.barrierFree && <Icon icon='fa:wheelchair' />}
      </div>
    </div>
  )
}

const lineClassRecord = lineClasses as Record<string, string>

const LineTitle: FC<{ line: string }> = ({ line }) => {
  const classes = lineClassRecord[line] ?? 'bg-black'
  return <span className={`px-2 text-white rounded ${classes}`}>{line}</span>
}

const LineComponent: FC<{ line: Line; maxDepartures?: number }> = ({
  line,
  maxDepartures = 4,
}) => {
  const shownDepartures = useMemo(
    () => line.departures?.departure.slice(0, maxDepartures) ?? [],
    [line.departures.departure, maxDepartures]
  )
  return (
    <div className='border-2 rounded'>
      <span className='p-4 font-bold flex gap-2 items-center bg-gray-100'>
        <LineTitle line={line.name} /> {line.towards}
      </span>
      <div className='border-b-2' />
      <div className='flex flex-col'>
        {shownDepartures.map((departure, index) => (
          <div
            key={index}
            className={`border-b-${
              index === shownDepartures.length - 1 ? '0' : '2'
            } px-4 py-2`}
          >
            <DepartureListItem departure={departure} />
          </div>
        ))}
      </div>
    </div>
  )
}

const MonitorComponent: FC<{ monitor: Monitor }> = ({ monitor }) => {
  return (
    <div className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4'>
      <div className='flex flex-col m-2'>
        {monitor.lines.map((line) => (
          <LineComponent line={line} key={line.lineId} />
        ))}
      </div>
    </div>
  )
}

const StationPage: NextPage = () => {
  const router = useRouter()
  const stationName = router.query.name as string
  const { data: station } = trpc.proxy.station.getByName.useQuery({
    stationName,
  })

  const { data: monitors } = trpc.proxy.monitor.getAllByStopIds.useQuery(
    { stopIds: station?.stops ?? [] },
    {
      refetchInterval: 30 * 1000,
    }
  )
  return (
    <>
      <Head>
        <title>{stationName} - WienerTime</title>
        <meta
          name='description'
          content='Real-time traffic data of Wiener Linien monitors.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='min-h-screen pb-[50px] flex flex-col'>
        <Header />
        <main className='flex-1 flex flex-col'>
          <div className='flex items-center justify-between m-4 mb-2'>
            <h1 className='text-3xl sm:text-4xl md:text-5xl'>{stationName}</h1>
            <FavoriteToggle
              stationName={stationName}
              isFavorite={station?.isFavorite}
            />
          </div>
          <div className='flex flex-1 flex-wrap justify-center m-2'>
            {!monitors && <Spinner />}
            {monitors?.length === 0 && (
              <div className='flex-1 flex items-center justify-center'>
                No data available :(
              </div>
            )}
            {monitors?.map((monitor, index) => (
              <MonitorComponent key={index} monitor={monitor} />
            ))}
          </div>
        </main>
        <Nav />
      </div>
    </>
  )
}

export default StationPage
