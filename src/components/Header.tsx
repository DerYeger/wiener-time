import { Icon } from '@iconify/react'
import { signOut, signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { FC } from 'react'

const Header: FC = () => {
  const session = useSession()

  return (
    <header className='p-2 pr-4 bg-gray-100 border-b-gray-200 border-b-2'>
      {session.data && (
        <div className='w-full flex items-center justify-between'>
          <Link href='/' className='cursor-pointer'>
            <img
              src={session.data.user?.image ?? ''}
              alt={session.data.user?.name ?? ''}
              className='rounded-lg w-12 aspect-1/1'
            />
          </Link>
          <button
            title='Logout'
            onClick={() => signOut()}
            className='text-xl text-gray-400 hover:text-red-600 transition-colors'
          >
            <Icon icon='fa:sign-out' />
          </button>
        </div>
      )}
      {!session.data && (
        <div className='w-full flex items-center justify-between h-12'>
          <h1 className='text-3xl font-light'>WienerTime</h1>
          <button
            title='Login'
            onClick={() => signIn()}
            className='text-xl text-gray-400 hover:text-green-600 transition-colors'
          >
            <Icon icon='fa:sign-in' />
          </button>
        </div>
      )}
    </header>
  )
}

export default Header
