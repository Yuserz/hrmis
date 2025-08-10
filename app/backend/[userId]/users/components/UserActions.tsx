import { JSX } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UserActions(): JSX.Element {
  return (
    <div className='w-full text-right'>
      <Button>
        Add User <Plus className='w-5 h-5' />
      </Button>
    </div>
  )
}
