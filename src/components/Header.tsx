import { Icon } from '@iconify/react'
import { signOut, signIn, useSession } from 'next-auth/react'
import Image from 'next/future/image'
import { FC } from 'react'

const Header: FC = () => {
  const session = useSession()

  return (
    <header className='py-2 px-4 bg-gray-100 border-b-gray-200 border-b-2 sticky top-0'>
      {session.data && (
        <div className='w-full flex items-center justify-between'>
          <Image
            src={session.data.user?.image ?? ''}
            alt={session.data.user?.name ?? ''}
            width={48}
            height={48}
            className='rounded-lg'
          />
          <button
            title='Logout'
            onClick={() => signOut()}
            className='text-xl text-gray-400 hover:text-gray-600 transition-colors'
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
            className='text-xl text-gray-400 hover:text-gray-600 transition-colors'
          >
            <Icon icon='fa:sign-in' />
          </button>
        </div>
      )}
    </header>
  )
}

export default Header
