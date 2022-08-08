import { Icon } from '@iconify/react'
import { FC } from 'react'
import { trpc } from '../utils/trpc'

const FavoriteToggle: FC<{ stationName: string; isFavorite: boolean }> = ({
  stationName,
  isFavorite,
}) => {
  const utils = trpc.useContext()
  const addFavorite = trpc.proxy.station.addFavorite.useMutation({
    onSuccess() {
      utils.invalidateQueries(['station.getAll'])
      utils.invalidateQueries(['station.getByStationName', stationName])
    },
  })
  const removeFavorite = trpc.proxy.station.removeFavorite.useMutation({
    onSuccess() {
      utils.invalidateQueries(['station.getAll'])
      utils.invalidateQueries(['station.getByStationName', stationName])
    },
  })

  const toggleFavorite = () => {
    if (isFavorite) {
      return removeFavorite.mutateAsync(stationName)
    }
    return addFavorite.mutateAsync(stationName)
  }
  return (
    <button onClick={toggleFavorite}>
      <Icon
        icon={isFavorite ? 'fa:heart' : 'fa:heart-o'}
        className='text-red-500 text-2xl'
      />
    </button>
  )
}

export default FavoriteToggle
