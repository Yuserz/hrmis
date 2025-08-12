'use client'

import { JSX, useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Controller } from 'react-hook-form'
import { Label } from '@radix-ui/react-label'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { useUserDialog } from '@/services/auth/state/user-dialog'
import { UserForm } from '@/lib/types/users'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { roleTypes } from '@/app/auth/sign-in/helpers/constants'
import { ImageUpload } from '@/components/custom/ImageUpload'

interface EditUserDialog extends UserForm {
  avatar: File[]
}

export function EditUserDialog(): JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>('')

  const { open, toggleOpen, type } = useUserDialog(
    useShallow((state) => ({
      open: state.open,
      type: state.type,
      toggleOpen: state.toggleOpenDialog
    }))
  )

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
    control
  } = useForm<EditUserDialog>()

  const resetVariable = (): void => {
    reset({
      email: '',
      username: '',
      employee_id: '',
      role: ''
    })
    setMessage('')
    router.refresh()
    toggleOpen?.(false, null)
  }

  const onSubmit = async (data: EditUserDialog): Promise<void> => {
    const { username, role, employee_id, avatar } = data
    startTransition(async () => {
      try {
        resetVariable()
      } catch (error) {
        setMessage(error as string)
      }
    })
  }

  const isOpenDialog = open && type === 'edit'

  return (
    <Dialog open={isOpenDialog} onOpenChange={() => toggleOpen?.(false, null)}>
      <DialogContent className='sm:max-w-[40rem]'>
        <DialogHeader>
          <DialogTitle>Edit New User</DialogTitle>
        </DialogHeader>

        <Input
          title='Username'
          {...register('username', {
            required: 'Field is required.'
          })}
          hasError={!!errors.email}
          errorMessage={errors.email?.message}
        />

        <div className='grid grid-cols-2 gap-2'>
          <div className='space-y-2'>
            <Label className='text-sm font-medium mb-1.5'>Role*</Label>
            <Controller
              name='role'
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  value={value as string}
                  onValueChange={(e) => onChange(e)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent>
                    {roleTypes.map((item, index) => (
                      <SelectItem key={`${item}-${index}`} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {!!errors.role && (
              <h1 className='text-sm text-red-500'>{errors.role.message}</h1>
            )}
          </div>

          <Input title='Employee ID' isOptional {...register('employee_id')} />
        </div>

        <div className='space-y-2'>
          <Controller
            name='avatar'
            control={control}
            render={({ field: { onChange, value } }) => (
              <ImageUpload
                title='Image'
                pendingFiles={value as File[]}
                isLoading={isPending}
                acceptedImageCount={1}
                setPendingFiles={(value) => onChange(value)}
              />
            )}
          />
          {!!errors.avatar && (
            <h1 className='text-sm text-red-500'>{errors.avatar.message}</h1>
          )}
        </div>
        {!!message && <p className='text-sm text-red-500'>{message}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type='button'
              variant='outline'
              onClick={() => resetVariable()}
            >
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <CustomButton
              type='button'
              onClick={handleSubmit(onSubmit)}
              disabled={isPending}
              isLoading={isPending}
            >
              Update
            </CustomButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
