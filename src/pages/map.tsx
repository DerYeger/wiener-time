import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { useMemo } from 'react'
import Header from '../components/Header'
import Nav from '../components/Nav'
import lib from '../lib'
import LazyMap, { LazyMarker, LazyMarkerCluster } from '../components/Map.lazy'
import { useRouter } from 'next/router'

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
  const router = useRouter()
  const markers = useMemo<{ name: string; location: [number, number] }[]>(
    () =>
      stations
        ?.filter((station) => station.location)
        .map(({ name, location }) => ({ name, location: location! })),
    [stations]
  )

  return (
    <>
      <div className='min-h-screen pb-[50px] flex flex-col'>
        <Header />
        <main className='flex-1 flex-basis-full flex flex-col'>
          <div className='flex-1 w-full flex flex-col'>
            <LazyMap
              center={lib.centerOfVienna}
              zoom={14}
              zoomControl={false}
              doubleClickZoom={false}
              markerZoomAnimation={false}
            >
              <LazyMarkerCluster>
                {markers?.map(({ name, location }) => (
                  <LazyMarker
                    position={location}
                    title={name}
                    key={name}
                    eventHandlers={{
                      click: () =>
                        router.push(`/stations/${lib.encodeStationName(name)}`),
                    }}
                  />
                ))}
              </LazyMarkerCluster>
            </LazyMap>
          </div>
        </main>
        <Nav />
      </div>
    </>
  )
}

export default MapPage
