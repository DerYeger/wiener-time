import { NextPage, NextPageContext } from 'next'
import { useRouter } from 'next/router'
import { trpc } from '../../utils/trpc'

const StationPage: NextPage = () => {
  const router = useRouter()
  const { name } = router.query
  const { data: stops } = trpc.proxy.station.getByStationName.useQuery(
    name as string
  )
  const { data: monitors } = trpc.proxy.monitor.getByStopIds.useQuery(
    stops?.map((stop) => stop.StopID) ?? []
  )
  if (!monitors) {
    return <span>Loading {name}</span>
  }
  return (
    <div className='flex flex-col'>
      {monitors.length === 0 && <span>No data</span>}
      {monitors.map((monitor, index) => (
        <pre key={index}>{JSON.stringify(monitor)}</pre>
      ))}
    </div>
  )
}

export default StationPage
