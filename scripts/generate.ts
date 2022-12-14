import csv from 'csvtojson'
import fs from 'fs/promises'
import fetch from 'node-fetch'
import { z } from 'zod'
import lib from '../src/lib'
import { StaticStopData, StaticStopDataSchema } from '../src/model'

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

const parseStations = (stops: StaticStopData[]) => {
  const stations = new Map<string, StaticStopData[]>()
  stops.forEach((stop) => {
    stations?.set(stop.StopText!, [
      ...(stations?.get(stop.StopText!) ?? []),
      stop,
    ])
  })
  return Object.fromEntries(
    [...stations.entries()].sort().map(([name, stops]) => [
      name,
      {
        name,
        stops: stops.map((stop) => stop.StopID),
        location: lib.calculateCenter(
          stops
            .filter((stop) => stop.Latitude && stop.Longitude)
            .map((stop) => [stop.Latitude!, stop.Longitude!])
        ),
      },
    ])
  )
}

const generate = async () => {
  console.log('Fetching...')
  const stops = await fetchStaticStopData()

  console.log('Parsing...')
  const stations = parseStations(stops)

  console.log('Writing...')
  await fs.writeFile('./src/stations.json', JSON.stringify(stations), {
    flag: 'wx',
  })

  console.log('Done')
}

generate()
