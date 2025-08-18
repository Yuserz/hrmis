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
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import {
  useSearchParams,
  usePathname,
  permanentRedirect
} from 'next/navigation'
import { updatePassword } from '@/services/users/users.services'

interface UpdatePassword {
  password: string
  confirmPassword: string
}

export function UpdatePassword(): JSX.Element {
  const [isPending, startTransition] = useTransition()

  const pathname = usePathname()
  const params = useSearchParams()
  const getParams = new URLSearchParams(params)

  getParams.get('password-reset')

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError
  } = useForm<UpdatePassword>()

  const resetVariables = (): void => {
    permanentRedirect(pathname)
  }

  const onResetPassword = async (data: UpdatePassword): Promise<void> => {
    startTransition(async () => {
      const { password, confirmPassword } = data
      if (password !== confirmPassword) {
        setError('confirmPassword', {
          message: "password doesn't matched"
        })
        return
      }

      await updatePassword(password)

      resetVariables()
    })
  }

  return (
    <Dialog
      open={Boolean(getParams.get('password-reset'))}
      onOpenChange={() => resetVariables()}
    >
      <DialogContent className='sm:max-w-[40rem]'>
        <DialogHeader>
          <DialogTitle>New Password</DialogTitle>
        </DialogHeader>

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

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type='button'
              variant='outline'
              onClick={() => resetVariables()}
            >
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <CustomButton
              type='button'
              disabled={isPending}
              isLoading={isPending}
              onClick={handleSubmit(onResetPassword)}
            >
              Update
            </CustomButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
