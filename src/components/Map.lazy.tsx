import dynamic from 'next/dynamic'

const LazyMap = dynamic(() => import('./Map'), { ssr: false })

export const LazyMarker = dynamic(
  async () => (await import('react-leaflet')).Marker,
  { ssr: false }
)

export default LazyMap
