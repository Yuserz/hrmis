'use client'

import { JSX, ReactNode, ComponentProps } from 'react'
import { PreviousButton } from './PreviousButton'
import { usePathname } from 'next/navigation'

interface Container extends ComponentProps<'div'> {
  children: ReactNode
  title: string
  description: string
  childClassName?: string
}

export const Container = ({
  children,
  title,
  description,
  childClassName,
  ...props
}: Container): JSX.Element => {
  const pathname = usePathname()
  const isHomePage =
    pathname.endsWith('/businesses') || pathname.startsWith('/backend/')

  return (
    <main className='space-y-4' {...props}>
      <div className='space-y-2'>
        <h1 className='text-4xl font-bold'>{title}</h1>
        <p className='text-sm text-gray-400'>{description}</p>
      </div>
      {!isHomePage && <PreviousButton />}
      <div className={childClassName}>{children}</div>
    </main>
  )
}
