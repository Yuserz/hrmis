'use client'

import { JSX, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { useLeaveApplicationDialog } from '@/services/leave_applications/states/leave-application-dialog'
import { useShallow } from 'zustand/react/shallow'
import { useRouter } from 'next/navigation'

export function FileLeaveDialog(): JSX.Element {
  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  const { open, toggleOpen, type } = useLeaveApplicationDialog(
    useShallow((state) => ({
      open: state.open,
      type: state.type,
      data: state.data,
      toggleOpen: state.toggleOpenDialog
    }))
  )

  const resetVariables = (): void => {
    toggleOpen?.(false, null, null)
    router.refresh()
  }

  const onSubmit = (): void => {
    startTransition(async () => {
      console.log()
    })
  }

  const isOpenDialog = open && type === 'add'

  return (
    <Dialog
      open={isOpenDialog}
      onOpenChange={() => toggleOpen?.(false, null, null)}
    >
      <DialogContent className='sm:max-w-[40rem]'>
        <DialogHeader>
          <DialogTitle>Leave Applications</DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <CustomButton type='button' isLoading={isPending}>
              Create
            </CustomButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
