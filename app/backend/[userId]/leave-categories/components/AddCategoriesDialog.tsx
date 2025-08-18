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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { useLeaveCategoriesDialog } from '@/services/leave_categories/states/leave-categories-dialog'
import { addLeaveCategories } from '@/services/leave_categories/leave-categories.services'
import { useShallow } from 'zustand/react/shallow'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { LeaveCategories } from '@/lib/types/leave_categories'

type LeaveCategoriesForm = Pick<LeaveCategories, 'name'>

export function AddLeaveCategoriesDialog(): JSX.Element {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LeaveCategoriesForm>()

  const router = useRouter()

  const { open, toggleOpen, type } = useLeaveCategoriesDialog(
    useShallow((state) => ({
      open: state.open,
      type: state.type,
      toggleOpen: state.toggleOpenDialog
    }))
  )

  const resetVariables = (): void => {
    toggleOpen?.(false, null, null)
    router.refresh()
  }

  const onSubmit = async (data: LeaveCategoriesForm): Promise<void> => {
    const { name } = data
    startTransition(async () => {
      await addLeaveCategories(name as string)
      resetVariables()
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
          <DialogTitle>Add Leave Categories</DialogTitle>
        </DialogHeader>

        <Input
          title='Name'
          {...register('name', {
            required: 'Required field.'
          })}
          hasError={!!errors.name}
          errorMessage={errors.name?.message}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <CustomButton
              type='button'
              isLoading={isPending}
              onClick={handleSubmit(onSubmit)}
            >
              Create
            </CustomButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
