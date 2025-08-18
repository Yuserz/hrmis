'use client'

import { JSX, useTransition } from 'react'
import { useLeaveCategoriesDialog } from '@/services/leave_categories/states/leave-categories-dialog'
import { DialogAlert } from '@/components/custom/DialogAlert'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/shallow'
import { deleteLeaveCategories } from '@/services/leave_categories/leave-categories.services'

export function DeleteLeaveCategoryDialog(): JSX.Element {
  const [isPending, startTransition] = useTransition()
  const { open, type, toggleOpen, data } = useLeaveCategoriesDialog(
    useShallow((state) => ({
      open: state.open,
      type: state.type,
      data: state.data,
      toggleOpen: state.toggleOpenDialog
    }))
  )
  const router = useRouter()

  const resetVariables = (): void => {
    toggleOpen?.(false, null, null)
    router.refresh()
  }

  const onDeleteCategories = async (): Promise<void> => {
    startTransition(async () => {
      await deleteLeaveCategories(data?.id as string)
      resetVariables()
    })
  }

  return (
    <DialogAlert
      open={open && type === 'delete'}
      title='Delete Category?'
      description='Do you want to delete this category?'
      callback={onDeleteCategories}
      cancel={() => toggleOpen?.(false, null, null)}
      isLoading={isPending}
      type='error'
    />
  )
}
