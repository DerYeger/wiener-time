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
  if (isFavorite) {
    return (
      <button
        onClick={() => removeFavorite.mutate(stationName)}
        className='bg-red-500 rounded px-4 py-2 text-white'
      >
        Unfav
      </button>
    )
  }
  return (
    <button
      onClick={() => addFavorite.mutate(stationName)}
      className='bg-blue-500 rounded px-4 py-2 text-white'
    >
      Fav
    </button>
  )
}

export default FavoriteToggle
