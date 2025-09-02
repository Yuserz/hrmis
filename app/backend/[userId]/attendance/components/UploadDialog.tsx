'use client'

import { JSX } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { FilePieChart, FileText } from 'lucide-react'
import { useShallow } from 'zustand/shallow'
import { Button } from '@/components/ui/button'
import { useUploadAttendanceDialog } from '@/services/attendance/state/attendance-dialog'

export function UploadDialog(): JSX.Element {
  const { open, toggleOpen, type } = useUploadAttendanceDialog(
    useShallow((state) => ({
      open: state.open,
      type: state.type,
      toggleOpen: state.toggleOpenDialog
    }))
  )

  const isOpenDialog = open && type === 'upload'

  return (
    <Dialog open={isOpenDialog} onOpenChange={() => toggleOpen?.(false, null)}>
      <DialogContent className='sm:max-w-[30rem]'>
        <DialogHeader>
          <DialogTitle>Select File Upload</DialogTitle>
        </DialogHeader>
        <main className='grid grid-cols-2 gap-2'>
          <div className='cursor-pointer ring-2 ring-gray-500/20 hover:ring-blue-500 focus:ring-blue-500 rounded-sm p-4 flex flex-col items-center justify-center gap-1 text-center'>
            <FilePieChart className='h-10 w-10 text-blue-500' />
            <h1 className='font-bold'>CSV File</h1>
            <p className='text-gray-500 text-sm'>
              Upload data in comma-separated values format
            </p>
          </div>

          <div className='cursor-pointer ring-2 ring-gray-500/20 hover:ring-blue-500 focus:ring-blue-500 rounded-sm p-4 flex flex-col items-center justify-center gap-1 text-center'>
            <FileText className='h-10 w-10 text-blue-500' />
            <h1 className='font-bold'>BAT File</h1>
            <p className='text-gray-500 text-sm'>
              Upload btach processing script file
            </p>
          </div>
        </main>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
