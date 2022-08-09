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
import { createContext } from '../../server/trpc/context'
import lineClasses from '../../lineClasses.json'

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

const lineClassRecord = lineClasses as Record<string, string>

const LineTitle: FC<{ line: string }> = ({ line }) => {
  const classes = lineClassRecord[line] ?? 'bg-black'
  return <span className={`px-1 text-white rounded ${classes}`}>{line}</span>
}

const LineComponent: FC<{ line: Line; maxDepartures?: number }> = ({
  line,
  maxDepartures = 4,
}) => {
  return (
    <div className='border-2 p-4 rounded'>
      <h1 className='font-bold flex gap-2 items-center'>
        <LineTitle line={line.name} /> {line.towards}
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
      <Header />
      <main>
        <div className='flex items-center justify-between my-8 mx-4'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl'>{stationName}</h1>
          <FavoriteToggle
            stationName={stationName}
            isFavorite={station?.isFavorite}
          />
        </div>
        <div className='flex flex-wrap justify-center m-2'>
          {!monitors && <Spinner />}
          {monitors?.length === 0 && <span>No data</span>}
          {monitors?.map((monitor, index) => (
            <MonitorComponent key={index} monitor={monitor} />
          ))}
        </div>
      </main>
    </>
  )
}

export default StationPage
