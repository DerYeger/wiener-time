import { Prisma, PrismaClient } from '@prisma/client'
import csv from 'csvtojson'
import fetch from 'node-fetch'
import { z } from 'zod'
import { StaticStopData, StaticStopDataSchema } from '../src/model'

const fetchStaticStopData = async () => {
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
  return Object.fromEntries(stationMap.entries())
}

const prisma = new PrismaClient()

const seedStations = async () => {
  console.log('Seeding Stations')

  console.log('Deleting')
  await prisma.station.deleteMany({})
  await prisma.stop.deleteMany({})

  console.log('Fetching')
  const stationData = await fetchStaticStopData()

  const newStations: Prisma.StationCreateManyInput[] = Object.entries(
    stationData
  ).map(([name]) => ({ name }))

  const newStops: Prisma.StopCreateManyInput[] = Object.entries(
    stationData
  ).flatMap(([name, stops]) =>
    stops.flatMap((stop) => ({ id: stop.StopID, stationName: name }))
  )

  console.log('Inserting')
  await prisma.$transaction([
    prisma.stop.createMany({
      data: newStops,
    }),
    prisma.station.createMany({
      data: newStations,
    }),
  ])
}

const seed = async () => {
  await seedStations()
  console.log('Done')
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
