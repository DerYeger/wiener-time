import { Icon } from '@iconify/react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FC } from 'react'
import FavoriteToggle from '../../components/FavoriteToggle'
import Spinner from '../../components/Spinner'
import { Departure, Line, Monitor } from '../../model'
import { trpc } from '../../utils/trpc'

const DepartureListItem: FC<{ departure: Departure }> = ({ departure }) => {
  let delay = 1
  if (departure.departureTime.timeReal) {
    const planned = new Date(departure.departureTime.timePlanned).getTime()
    const expected = new Date(departure.departureTime.timeReal).getTime()
    delay = Math.ceil((expected - planned) / 1000 / 60)
  }

  const departureTime =
    departure.departureTime.countdown === 0 ? (
      <span>Now</span>
    ) : (
      <span>{departure.departureTime.countdown} minutes</span>
    )

  return (
    <div className='flex justify-between items-center h-[40px]'>
      <div className='flex flex-col'>
        {departureTime}
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
  // TODO: Also sent fav data
  const { data: stops } = trpc.proxy.station.getByStationName.useQuery(name)
  const { data: monitors } = trpc.proxy.monitor.getByStopIds.useQuery(
    stops?.map((stop) => stop.StopID) ?? [],
    { refetchInterval: 30 * 1000 }
  )
  return (
    <div>
      <div className='flex items-center justify-between my-8 mx-4'>
        <h1 className='text-center text-5xl'>{name}</h1>
        <FavoriteToggle stationName={name} isFavorite={false} />
      </div>

      <div className='flex flex-wrap justify-center m-2'>
        {!monitors && <Spinner />}
        {monitors?.length === 0 && <span>No data</span>}
        {monitors?.map((monitor, index) => (
          <MonitorComponent key={index} monitor={monitor} />
        ))}
      </div>
    </div>
  )
}

export default StationPage
