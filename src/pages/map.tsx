import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { useState, useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { Stations } from './stations'
import Header from '../components/Header'
import Nav from '../components/Nav'
import lib from '../lib'
import LazyMap, { LazyMarker } from '../components/Map.lazy'

export const getStaticProps: GetStaticProps<{
  stations: { name: string; stops: number[]; location?: [number, number] }[]
}> = async () => {
  const stations = await lib.fetchAllStations()
  return {
    props: {
      stations,
    },
    revalidate: 86400,
  }
}

const MapPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  stations,
}) => {
  const markers = useMemo<[number, number][]>(
    () =>
      stations
        ?.filter((station) => station.location)
        .map(({ location }) => location!),
    [stations]
  )
  console.log(markers)

  return (
    <>
      <div className='min-h-screen pb-[50px] flex flex-col'>
        <Header />
        <main className='flex-1 flex-basis-full flex flex-col'>
          <div className='flex-1 w-full flex flex-col'>
            <LazyMap
              markers={markers ?? []}
              center={lib.centerOfVienna}
              zoom={12}
              zoomControl={false}
              doubleClickZoom={false}
              markerZoomAnimation={false}
            >
              {markers?.map((marker, index) => (
                <LazyMarker position={marker} key={index} />
              ))}
            </LazyMap>
          </div>
        </main>
        <Nav />
      </div>
    </>
  )
}

export default MapPage
