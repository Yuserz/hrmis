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
import { regularEmailRegex } from '@/helpers/reusableRegex'
import { useCreateUserDialog } from '@/services/auth/state/add-user-dialog'
import { UserForm } from '@/lib/types/users'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { signUp } from '@/services/auth/auth.services'
import { roleTypes } from '@/app/auth/sign-in/helpers/constants'
import { ImageUpload } from '@/components/custom/ImageUpload'

interface AddUserDialog extends UserForm {
  password: string
  confirmPassword: string
  avatar: File[]
}

interface UserFormData extends UserForm {
  avatar: File[]
}

export function AddUserDialog(): JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>('')

  const { open, toggleOpen, type } = useCreateUserDialog(
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
    setError,
    control
  } = useForm<AddUserDialog>()

  const resetVariable = (): void => {
    reset({
      email: '',
      password: '',
      username: '',
      confirmPassword: '',
      employee_id: '',
      role: ''
    })
    setMessage('')
    router.refresh()
    toggleOpen?.(false, null)
  }

  const onSubmit = async (data: AddUserDialog): Promise<void> => {
    const { email, username, role, employee_id, avatar } = data
    startTransition(async () => {
      try {
        const { password, confirmPassword } = data
        if (password !== confirmPassword) {
          setError('confirmPassword', {
            message: "password doesn't matched"
          })
          return
        }

        await signUp({
          email,
          username: username?.toLowerCase() as string,
          password,
          role,
          employee_id,
          avatar: avatar || []
        } as UserFormData)
        resetVariable()
      } catch (error) {
        setMessage(error as string)
      }
    })
  }

  const isOpenDialog = open && type === 'add'

  return (
    <Dialog open={isOpenDialog} onOpenChange={() => toggleOpen?.(false, null)}>
      <DialogContent className='sm:max-w-[40rem]'>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-2'>
          <Input
            title='Email'
            {...register('email', {
              required: 'Field is required.',

              pattern: {
                value: regularEmailRegex,
                message: 'invalid email address'
              }
            })}
            hasError={!!errors.email}
            errorMessage={errors.email?.message}
          />

          <Input
            title='Username'
            {...register('username', {
              required: 'Field is required.'
            })}
            hasError={!!errors.email}
            errorMessage={errors.email?.message}
          />
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <Input
            title='Password'
            type='password'
            {...register('password', {
              required: 'Field is required.'
            })}
            hasError={!!errors.password}
            errorMessage={errors.password?.message}
          />
          <Input
            title='Confirm Password'
            type='password'
            {...register('confirmPassword', {
              required: 'Field is required.'
            })}
            hasError={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.message}
          />
        </div>

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
              Create
            </CustomButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
