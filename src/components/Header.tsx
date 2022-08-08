import { signOut, signIn, useSession } from 'next-auth/react'
import { FC } from 'react'

const Header: FC = () => {
  const session = useSession()

  return (
    <div className='flex justify-center m-4'>
      {session.data && (
        <div className='w-full flex items-center justify-between'>
          <img
            src={session.data.user?.image}
            alt={session.data.user?.name}
            className='rounded-lg w-16 aspect-1/1'
          />
          <button
            onClick={() => signOut()}
            className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded'
          >
            Logout
          </button>
        </div>
      )}
      {!session.data && (
        <div className='w-full flex justify-end'>
          <button
            onClick={() => signIn()}
            className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded'
          >
            Login
          </button>
        </div>
      )}
    </div>
  )
}

export default Header
