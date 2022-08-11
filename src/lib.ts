import csv from 'csvtojson'
import { z } from 'zod'
import {
  MonitorResponseSchema,
  StaticStopData,
  StaticStopDataSchema,
} from './model'

const fetchStaticStopData = async (): Promise<StaticStopData[]> => {
  const res = await fetch(
    'https://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien-ogd-haltepunkte.csv'
  )
  const body = await res.text()
  const json = await csv({
    delimiter: ';',
    checkType: true,
    ignoreEmpty: true,
  }).fromString(body)

  const data = z
    .array(StaticStopDataSchema)
    .parse(json)
    .filter(
      (stop) => stop.StopText && stop.Latitude && stop.Longitude && stop.DIVA
    )
  return data
}

const fetchStationByName = async (name: string) => {
  const stops = await fetchStaticStopData()
  return {
    name,
    stops: stops
      .filter((stop) => stop.StopText === name)
      .map((stop) => stop.StopID),
  }
}

const calculateCenter = (
  locations: [number, number][] | undefined
): [number, number] | undefined => {
  if (!locations || locations.length === 0) {
    return undefined
  }
  const [totalX, totalY] = locations.reduce<[number, number]>(
    ([accX, accY], [locX, locY]) => {
      return [accX + locX, accY + locY]
    },
    [0, 0]
  )
  return [totalX / locations.length, totalY / locations.length]
}

const fetchAllStations = async () => {
  const stops = await fetchStaticStopData()
  const stations = new Map<string, StaticStopData[]>()
  stops.forEach((stop) => {
    stations?.set(stop.StopText!, [
      ...(stations?.get(stop.StopText!) ?? []),
      stop,
    ])
  })
  return [...stations.entries()].sort().map(([name, stops]) => ({
    name,
    stops: stops.map((stop) => stop.StopID),
    location: calculateCenter(
      stops
        .filter((stop) => stop.Latitude && stop.Longitude)
        .map((stop) => [stop.Longitude!, stop.Latitude!])
    ),
  }))
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

const centerOfVienna: [number, number] = [48.2082, 16.3738]

const lib = {
  calculateCenter,
  centerOfVienna,
  decodeStationName,
  encodeStationName,
  fetchMonitorData,
  fetchAllStations,
  fetchStationByName,
}

export default lib
