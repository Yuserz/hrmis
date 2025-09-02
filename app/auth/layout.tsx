import { FolderKey } from 'lucide-react'
import Image from 'next/image'

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-center gap-2 md:justify-start'>
          <a href='#' className='flex items-center gap-2 font-medium'>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground'>
              <FolderKey className='size-4' />
            </div>
            HR Management System
          </a>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>{children}</div>
        </div>
      </div>
      <div className='relative hidden bg-muted lg:block'>
        <Image
          width={800}
          height={800}
          quality={90}
          src='/images/HR-management.jpg'
          alt='Image'
          className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
        />
      </div>
    </div>
  )
}
