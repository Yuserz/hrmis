'use client'

import { JSX, useTransition } from 'react'
import { useLeaveApplicationDialog } from '@/services/leave_applications/states/leave-application-dialog'
import { DialogAlert } from '@/components/custom/DialogAlert'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/shallow'
import { deleteLeaveRequest } from '@/services/leave_applications/leave-applications.services'

export function DeleteLeaveRequestDialog(): JSX.Element {
  const [isPending, startTransition] = useTransition()
  const { open, type, toggleOpen, data } = useLeaveApplicationDialog(
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

  const onDeleteLeaveRequest = async (): Promise<void> => {
    startTransition(async () => {
      await deleteLeaveRequest(data?.id as string)
      resetVariables()
    })
  }

  return (
    <DialogAlert
      open={open && type === 'delete'}
      title='Delete Leave Request?'
      description='Do you want to delete this leave request?'
      callback={onDeleteLeaveRequest}
      cancel={() => toggleOpen?.(false, null, null)}
      isLoading={isPending}
      type='error'
    />
  )
}
