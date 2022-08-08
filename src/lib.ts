import {
  MonitorResponseSchema,
} from './model'

const API_URL = 'https://www.wienerlinien.at'

const fetchMonitorData = async (stopIds: number[]) => {
  const res = await fetch(
    `${API_URL}/ogd_realtime/monitor?rbl=${stopIds.join(',')}`
  )
  const monitorResponse = MonitorResponseSchema.parse(await res.json())
  if (monitorResponse.message.messageCode !== 1) {
    throw new Error(monitorResponse.message.value)
  }
  if (!monitorResponse.data) {
    throw new Error('No data')
  }
  return monitorResponse.data.monitors
}

const lib = {
  fetchMonitorData,
}

export default lib
