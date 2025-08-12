import { useState, useRef, useEffect } from 'react'
import { X, CloudUpload } from 'lucide-react'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface ImageUploadProps {
  pendingFiles: File[]
  setPendingFiles: (files: File[]) => void
  title: string
  filePreview?: string
  isLoading?: boolean
  isHidePreview?: boolean
  acceptedImageCount?: number
}

interface LocalPreview {
  file: File
  url: string
}

export const ImageUpload = ({
  filePreview,
  pendingFiles,
  setPendingFiles,
  isLoading,
  title,
  isHidePreview = false,
  acceptedImageCount = 3
}: ImageUploadProps) => {
  const [message, setMessage] = useState<string>('')
  const [localPreviews, setLocalPreviews] = useState<LocalPreview[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRemoveFile = (preview: LocalPreview): void => {
    const findPreview = localPreviews.filter((prev) => prev.url !== preview.url)
    setLocalPreviews(findPreview)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    const maxSize = 2 * 1024 * 1024
    if (!files || files.length === 0) return

    if (files[0].size > maxSize) {
      setMessage('The image size is more than the limit, please upload new.')
      return
    }

    // Convert FileList to array
    const fileArray = Array.from(files)

    // Create local previews for immediate display
    const newLocalPreviews = fileArray.map((file) => ({
      file,
      url: URL.createObjectURL(file)
    }))

    if (acceptedImageCount > 1) {
      setPendingFiles([...pendingFiles, ...fileArray])

      setLocalPreviews([...localPreviews, ...newLocalPreviews])
    } else {
      setPendingFiles([files[0]])
      setLocalPreviews([{ file: files[0], url: URL.createObjectURL(files[0]) }])
    }

    // Clear the input for next selection
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      setMessage('')
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    if (isLoading) {
      setLocalPreviews([])
    }
  }, [isLoading])

  return (
    <div className='space-y-4'>
      <Label className='text-sm font-medium mb-1.5'>{title}</Label>
      <div className='flex flex-wrap gap-4'>
        {/* Hidden file input */}
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          accept='image/*'
          hidden
        />

        {/* Upload button */}
        <button
          type='button'
          onClick={handleBrowseClick}
          className='cursor-pointer w-full h-[15rem] border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors'
        >
          <CloudUpload size={40} />
          <span className='mt-1 text-xl font-medium'>Select Files</span>
          <span className='text-sm'>
            Supported format: PNG, JPG, PDF (max 2mb)
          </span>
        </button>
      </div>

      {!!message && <span className='text-red-500 text-sm'>{message}</span>}

      {/* Server images */}
      {filePreview && (
        <div className='relative w-24 h-24 border rounded-md overflow-hidden group'>
          <Image
            src={filePreview}
            width={500}
            height={500}
            alt='preview image'
            className='w-full h-full object-cover'
          />
          <button
            type='button'
            className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
            aria-label='Remove image'
          >
            <X size={14} />
          </button>
        </div>
      )}

      {!isHidePreview && (
        <div className='flex gap-2'>
          {/* Local previews */}
          {localPreviews.map((preview, index) => (
            <div
              key={`local-${index}`}
              className='relative w-24 h-24 border rounded-md overflow-hidden group border-blue-300'
            >
              <Image
                width={500}
                height={500}
                src={preview.url}
                alt={`New upload ${index + 1}`}
                className='w-full h-full object-cover'
              />
              <div className='absolute top-0 left-0 bg-blue-500 text-white text-xs px-1'>
                New
              </div>
              <button
                type='button'
                className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                aria-label='Remove image'
                onClick={() => handleRemoveFile(preview)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
