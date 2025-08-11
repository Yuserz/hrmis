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

interface AddUserDialog extends UserForm {
  password: string
  confirmPassword: string
}

export function AddUserDialog(): JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>('')

  const { open, toggleOpen } = useCreateUserDialog(
    useShallow((state) => ({
      open: state.open,
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
    router.refresh()
    toggleOpen?.(false)
  }

  const onSubmit = async (data: AddUserDialog): Promise<void> => {
    const { email, username, role, employee_id } = data
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
          username: username as string,
          password,
          role,
          employee_id
        } as UserForm)
        resetVariable()
      } catch (error) {
        setMessage(error as string)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={() => toggleOpen?.(false)}>
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

          <Input title='Employee ID' isOptional />
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
