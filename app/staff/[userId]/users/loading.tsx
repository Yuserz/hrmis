import { Spinner } from '@/components/custom/Spinner'
import { JSX } from 'react'

export default function Loading(): JSX.Element {
  return (
    <div className='flex items-center justify-center h-[85vh]'>
      <Spinner />
    </div>
  )
}
