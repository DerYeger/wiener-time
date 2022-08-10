import csv from 'csvtojson'
import { z } from 'zod'
import {
  MonitorResponseSchema,
  StaticStopData,
  StaticStopDataSchema,
} from './model'

let staticStopData: Record<string, StaticStopData[]> | undefined

const fetchStaticStopData = async () => {
  if (staticStopData) {
    return staticStopData
  }
  const res = await fetch(
    'https://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien-ogd-haltepunkte.csv'
  )
  const body = await res.text()
  const json = await csv({
    delimiter: ';',
    checkType: true,
    ignoreEmpty: true,
  }).fromString(body)

  const result = z
    .array(StaticStopDataSchema)
    .parse(json)
    .filter(
      (stop) => stop.StopText && stop.Latitude && stop.Longitude && stop.DIVA
    )
  const stationMap = new Map<string, StaticStopData[]>()
  result.forEach((stop) => {
    stationMap?.set(stop.StopText!, [
      ...(stationMap?.get(stop.StopText!) ?? []),
      stop,
    ])
  })
  staticStopData = Object.fromEntries(new Map([...stationMap.entries()].sort()))
  return staticStopData
}

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

const encodeStationName = (name: string) => name.replaceAll('/', '-:-')
const decodeStationName = (name: string) => name.replace('-:-', '/')

const lib = {
  encodeStationName,
  decodeStationName,
  fetchMonitorData,
  fetchStaticStopData,
}

export default lib
