import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC } from 'react'

const Nav: FC = () => {
  const router = useRouter()
  return (
    <nav className='bg-gray-100 border-t-gray-200 border-t-2 fixed left-0 right-0 bottom-0 flex justify-evenly'>
      <Link href='/' passHref>
        <a className='p-4'>
          <Icon
            icon='fa:home'
            className={router.pathname !== '/' ? 'text-black' : 'text-gray-500'}
          />
        </a>
      </Link>
    </nav>
  )
}

export default Nav
