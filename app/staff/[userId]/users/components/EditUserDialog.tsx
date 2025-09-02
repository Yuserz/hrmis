'use client'

import { JSX, useState, useTransition, useEffect } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { avatarName } from '@/helpers/avatarName'
import { Controller } from 'react-hook-form'
import { Label } from '@radix-ui/react-label'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CustomButton } from '@/components/custom/CustomButton'
import { useUserDialog } from '@/services/auth/states/user-dialog'
import { UserForm } from '@/lib/types/users'
import { useRouter } from 'next/navigation'
import { updateUserInfo } from '@/services/users/users.services'
import { useShallow } from 'zustand/react/shallow'
import { roleTypes } from '@/app/auth/sign-in/helpers/constants'
import { ImageUpload } from '@/components/custom/ImageUpload'
import { toPercentage } from '@/helpers/convertToPercent'
import { isEqual } from 'lodash'
import { toast } from 'sonner'

interface EditUserDialog extends UserForm {
  avatar: File[] | string
  oldAvatar: string
}

export function EditUserDialog(): JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>('')

  const { open, toggleOpen, type, data } = useUserDialog(
    useShallow((state) => ({
      open: state.open,
      type: state.type,
      toggleOpen: state.toggleOpenDialog,
      data: state.data
    }))
  )

  const oldData = {
    avatar: data?.avatar,
    employee_id: data?.employee_id,
    oldAvatar: data?.avatar,
    role: data?.role,
    username: data?.username,
    email: data?.email
  }

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
    control
  } = useForm<EditUserDialog>()

  const resetVariable = (): void => {
    setMessage('')
    router.refresh()
    toggleOpen?.(false, null, null)
  }

  const onSubmit = async (editData: EditUserDialog): Promise<void> => {
    const { avatar } = editData

    startTransition(async () => {
      try {
        if (isEqual(editData, oldData)) {
          toast.info('Info', {
            description: 'No changes in data.'
          })

          toggleOpen?.(false, null, null)
          return
        }

        await updateUserInfo({
          ...editData,
          email: data?.email as string,
          avatar: avatar as File[],
          id: data?.id as string
        })
        resetVariable()
      } catch (error) {
        setMessage(error as string)
      }
    })
  }

  useEffect(() => {
    if (!!data) {
      reset({
        avatar: data.avatar as string,
        username: data.username,
        role: data.role,
        employee_id: data.employee_id,
        oldAvatar: data.avatar as string,
        email: data.email as string
      })
    }
  }, [data, reset])

  const isOpenDialog = open && type === 'edit'

  return (
    <Dialog
      open={isOpenDialog}
      onOpenChange={() => toggleOpen?.(false, null, null)}
    >
      <DialogContent className='sm:max-w-[40rem]'>
        <DialogHeader>
          <DialogTitle>Edit New User</DialogTitle>

          <div className='flex items-center gap-2'>
            <Avatar className='h-20 w-20 rounded-full'>
              <AvatarImage
                src={data?.avatar as string}
                alt={data?.email as string}
                className='object-cover'
              />
              <AvatarFallback className='rounded-lg text-2xl fill-primary bg-primary text-white font-semibold'>
                {avatarName(data?.email as string)}
              </AvatarFallback>
            </Avatar>
            <section>
              <h1 className='font-medium'>{data?.email}</h1>
              <h2 className='text-md'>{data?.username}</h2>
            </section>
          </div>

          <div className='shadow-sm p-4 rounded-sm space-y-3'>
            <h1 className='font-medium'>Leave Credits</h1>
            <section className='flex items-center gap-2'>
              <Progress value={toPercentage(data?.credits as number, 10)} />
              <span className='text-sm'>{data?.credits}/10</span>
            </section>
          </div>
        </DialogHeader>

        <Input
          title='Username'
          {...register('username', {
            required: 'Field is required.'
          })}
          hasError={!!errors.username}
          errorMessage={errors.username?.message}
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
                filePreview={typeof value === 'string' ? value : undefined}
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
