import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC } from 'react'

const Nav: FC = () => {
  const router = useRouter()
  const targets = [
    {
      href: '/',
      icon: 'fa:home',
    },
    {
      href: '/about',
      icon: 'fa:info',
    },
  ]
  return (
    <nav className='bg-gray-100 border-t-gray-200 border-t-2 fixed left-0 right-0 bottom-0 flex justify-evenly'>
      {targets.map(({ href, icon }) => (
        <Link href={href} passHref key={href}>
          <a className='p-4'>
            <Icon
              icon={icon}
              className={
                router.pathname !== href ? 'text-black' : 'text-gray-500'
              }
            />
          </a>
        </Link>
      ))}
    </nav>
  )
}

export default Nav
