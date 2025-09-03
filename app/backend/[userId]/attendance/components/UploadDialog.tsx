'use client'

import { ChangeEvent, JSX, useRef, useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { FilePieChart, FileText, Trash } from 'lucide-react'
import { useShallow } from 'zustand/shallow'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { useUploadAttendanceDialog } from '@/services/attendance/state/attendance-dialog'
import {
  uploadCSVOrBatFile,
  UploadType
} from '@/services/attendance/attendance.services'

export function UploadDialog(): JSX.Element {
  const [uploadedFile, setUploadedFile] = useState<{
    file: File | null
    type: UploadType
  }>({
    file: null,
    type: 'upload-csv'
  })
  const [isPending, startTransition] = useTransition()

  const { open, toggleOpen, type } = useUploadAttendanceDialog(
    useShallow((state) => ({
      open: state.open,
      type: state.type,
      toggleOpen: state.toggleOpenDialog
    }))
  )

  const csvFileInputRef = useRef<HTMLInputElement>(null)
  const batFileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadFile = (
    event: ChangeEvent<HTMLInputElement>,
    type: UploadType
  ): void => {
    const file = event.target.files?.[0]
    setUploadedFile({ file: file as File, type })
  }

  const resetVariables = (): void => {
    setUploadedFile({ file: null, type: 'upload-csv' })

    if (csvFileInputRef.current) {
      csvFileInputRef.current.value = ''
    }

    if (batFileInputRef.current) {
      batFileInputRef.current.value = ''
    }
  }

  const onSubmit = async (): Promise<void> => {
    startTransition(async () => {
      const { file, type } = uploadedFile
      await uploadCSVOrBatFile(file as File, type)
      resetVariables()
    })
  }

  const handleCsvClick = (): void => {
    csvFileInputRef.current?.click()
  }

  const handleBatClick = (): void => {
    batFileInputRef.current?.click()
  }

  const isOpenDialog = open && type === 'upload'

  return (
    <Dialog open={isOpenDialog} onOpenChange={() => toggleOpen?.(false, null)}>
      <DialogContent className='sm:max-w-[30rem]'>
        <DialogHeader>
          <DialogTitle>Select File Upload</DialogTitle>
        </DialogHeader>
        <main className='grid grid-cols-2 gap-2'>
          <section>
            <input
              type='file'
              ref={csvFileInputRef}
              onChange={(e) => handleUploadFile(e, 'upload-csv')}
              accept='.csv'
              hidden
            />
            <div
              onClick={handleCsvClick}
              className='cursor-pointer ring-2 ring-gray-500/20 hover:ring-blue-500 focus:ring-blue-500 rounded-sm p-4 flex flex-col items-center justify-center gap-1 text-center'
            >
              <FilePieChart className='h-10 w-10 text-blue-500' />
              <h1 className='font-bold'>CSV File</h1>
              <p className='text-gray-500 text-sm'>
                Upload data in comma-separated values format
              </p>
            </div>
          </section>

          <section>
            <input
              type='file'
              ref={batFileInputRef}
              onChange={(e) => handleUploadFile(e, 'upload-dat')}
              accept='.dat'
              hidden
            />
            <div
              onClick={handleBatClick}
              className='cursor-pointer ring-2 ring-gray-500/20 hover:ring-blue-500 focus:ring-blue-500 rounded-sm p-4 flex flex-col items-center justify-center gap-1 text-center'
            >
              <FileText className='h-10 w-10 text-blue-500' />
              <h1 className='font-bold'>DAT File</h1>
              <p className='text-gray-500 text-sm'>
                Upload btach processing script file
              </p>
            </div>
          </section>
        </main>

        {!!uploadedFile.file && (
          <span className='bg-blue-500 text-sm py-2 px-3 rounded-md text-white flex items-center gap-2 font-medium'>
            <FileText className='w-5 h-5 text-white' />
            {uploadedFile?.file?.name}

            <Trash
              className='w-5 h-5 cursor-pointer'
              onClick={resetVariables}
            />
          </span>
        )}

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
              disabled={!uploadedFile.file}
              onClick={onSubmit}
            >
              Upload
            </CustomButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
