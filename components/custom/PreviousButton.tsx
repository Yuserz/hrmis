'use client'

import { JSX } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '../ui/button'

export function PreviousButton(): JSX.Element {
  const router = useRouter()

  const pathname = usePathname()
  const splitPath = pathname.split('/')
  const userId = splitPath.splice(2, 2)[0]

  const onPreviousPage = (): void => router.push(`/users/${userId}/businesses`)

  return (
    <Button
      variant='ghost'
      className='transparent'
      onClick={() => onPreviousPage()}
    >
      <ChevronLeft />
      Back
    </Button>
  )
}
