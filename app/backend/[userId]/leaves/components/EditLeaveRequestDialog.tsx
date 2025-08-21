'use client'

import { JSX, useTransition, useEffect } from 'react'
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
import { Plus } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { useLeaveApplicationDialog } from '@/services/leave_applications/states/leave-application-dialog'
import { useShallow } from 'zustand/react/shallow'
import { useRouter } from 'next/navigation'
import { Controller } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/services/auth/states/auth-state'
import { CalendarPicker } from '@/components/custom/CalendarPicker'
import { LeaveApplicationsFormData } from '@/lib/types/leave_application'
import { LeaveCategories } from '@/lib/types/leave_categories'
import { editLeaveRequest } from '@/services/leave_applications/leave-applications.services'
import { DateRange } from 'react-day-picker'

interface FileLeaveDialog {
  category: Pick<LeaveCategories, 'name' | 'id'>[]
}

export function EditFileLeaveDialog({
  category
}: FileLeaveDialog): JSX.Element {
  const [isPending, startTransition] = useTransition()
  const state = useAuth()
  const router = useRouter()

  const categoryData = category.map((item) => ({
    id: item.id,
    name: item.name
  }))

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    watch,
    reset
  } = useForm<LeaveApplicationsFormData>({
    defaultValues: {
      leave_id: '',
      remarks: '',
      dateRange: undefined
    }
  })

  const dateRange = watch('dateRange')

  const { open, toggleOpen, type, data } = useLeaveApplicationDialog(
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
    reset()
  }

  const onSubmit = (leaveData: LeaveApplicationsFormData): void => {
    const { leave_id, remarks } = leaveData
    const startDate = leaveData.dateRange?.from
    const endDate = leaveData.dateRange?.to

    const newData = {
      leave_id,
      user_id: state.id,
      status: 'pending',
      remarks,
      start_date: new Date(startDate as Date).toISOString(),
      end_date: new Date(endDate as Date).toISOString()
    }

    startTransition(async () => {
      await editLeaveRequest(newData as typeof newData, data?.id as string)
      resetVariables()
    })
  }

  useEffect(() => {
    if (!!data) {
      reset({
        leave_id: data.leave_categories?.id,
        dateRange: {
          from: new Date(data.start_date as string),
          to: new Date(data.end_date as string)
        },
        remarks: data.remarks
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
          <DialogTitle>Edit Leave Applications</DialogTitle>
        </DialogHeader>

        <div className='space-y-2'>
          <Label className='text-sm font-medium mb-1.5'>Leave Status*</Label>
          <Controller
            name='leave_id'
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                value={value as string}
                onValueChange={(e) => onChange(e)}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Leave Status' />
                </SelectTrigger>
                <SelectContent>
                  {categoryData.map((item, index) => (
                    <SelectItem key={`${item}-${index}`} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {!!errors.leave_id && (
            <h1 className='text-sm text-red-499'>{errors.leave_id.message}</h1>
          )}
        </div>

        <CalendarPicker
          title='Start and End Date'
          name='dateRange'
          control={control}
          date={dateRange as DateRange}
        />

        <Textarea
          title='Description'
          className='h-[10rem]'
          placeholder='Leave Description'
          hasError={!!errors.remarks}
          errorMessage={errors.remarks?.message}
          {...register('remarks', {
            required: 'Required field.'
          })}
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
              <Plus /> Update Request
            </CustomButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
