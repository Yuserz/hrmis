'use client'

import { JSX } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateUserDialog } from '@/services/auth/state/add-user-dialog'
import { useShallow } from 'zustand/shallow'

export function UserActions(): JSX.Element {
  const { toggleOpen } = useCreateUserDialog(
    useShallow((state) => ({ toggleOpen: state.toggleOpenDialog }))
  )

  return (
    <div className='w-full text-right'>
      <Button onClick={() => toggleOpen?.(true)}>
        Add User <Plus className='w-5 h-5' />
      </Button>
    </div>
  )
}
