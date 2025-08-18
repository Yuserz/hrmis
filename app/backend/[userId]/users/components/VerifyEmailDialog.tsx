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
import { regularEmailRegex } from '@/helpers/reusableRegex'
import { useUserDialog } from '@/services/auth/states/user-dialog'
import { useShallow } from 'zustand/shallow'
import { verifyEmail } from '@/services/users/users.services'
import { useRouter } from 'next/navigation'

interface VerifyEmail {
  email: string
}

export function VerifyEmail(): JSX.Element {
  const [isPending, startTransition] = useTransition()

  const { open, type, toggleOpen } = useUserDialog(
    useShallow((state) => ({
      open: state.open,
      type: state.type,
      toggleOpen: state.toggleOpenDialog
    }))
  )

  const router = useRouter()

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset
  } = useForm<VerifyEmail>()

  const resetVariables = (): void => {
    toggleOpen?.(false, null, null)
    reset({
      email: ''
    })
  }

  const onResetPassword = async (data: VerifyEmail): Promise<void> => {
    startTransition(async () => {
      const response = await verifyEmail(data.email)

      resetVariables()
      router.push(response)
    })
  }

  return (
    <Dialog
      open={open && type === 'verify-email'}
      onOpenChange={() => resetVariables()}
    >
      <DialogContent className='sm:max-w-[40rem]'>
        <DialogHeader>
          <DialogTitle>Verify Email</DialogTitle>
        </DialogHeader>

        <Input
          title='Email'
          type='email'
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
              Verify
            </CustomButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
