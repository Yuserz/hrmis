'use client'

import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Control, Controller } from 'react-hook-form'
import { LeaveApplicationsFormData } from '@/lib/types/leave_application'
import { DateRange } from 'react-day-picker'

interface CalendarPicker {
  title: string
  name: keyof LeaveApplicationsFormData
  control: Control<LeaveApplicationsFormData>
  date: DateRange
}

export function CalendarPicker({
  title,
  name,
  control,
  date
}: CalendarPicker): React.JSX.Element {
  const [open, setOpen] = React.useState(false)

  const placeholder = `${new Date(date?.from as Date).toLocaleDateString()} - ${new Date(date?.to as Date).toLocaleDateString()}`

  return (
    <div className='flex flex-col gap-3'>
      <Label htmlFor='date' className='px-1'>
        {title}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            id='date'
            className='w-full justify-between font-normal'
          >
            {date ? placeholder : 'Select date'}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-full overflow-hidden p-0 z-[1000]'
          align='start'
        >
          <Controller
            name={name as keyof LeaveApplicationsFormData}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Calendar
                mode='range'
                selected={value as DateRange}
                captionLayout='dropdown'
                timeZone='UTC'
                disabled={[{ before: new Date() }, { dayOfWeek: [0, 6] }]}
                onSelect={(date) => {
                  onChange(date)

                  if (date?.to !== date?.from) {
                    setOpen(false)
                  }
                }}
              />
            )}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
