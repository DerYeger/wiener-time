import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC } from 'react'

const Nav: FC = () => {
  const route = useRouter()
  return (
    <nav className='bg-gray-100 border-t-gray-200 border-t-2 fixed left-0 right-0 bottom-0 flex justify-evenly'>
      <div className='p-4 cursor-pointer'>
        <Link href='/'>
          <Icon
            icon='fa:home'
            className={route.pathname !== '/' ? 'text-black' : 'text-gray-400'}
          />
        </Link>
      </div>
    </nav>
  )
}

export default Nav
