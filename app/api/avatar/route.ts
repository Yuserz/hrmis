import {
  successResponse,
  generalErrorResponse
} from '@/app/api/helpers/response'
import { uploadImage } from '../helpers/image/image'
import { createClient } from '@/config'

export async function POST(req: Request) {
  try {
    const body = await req.formData()
    const supabase = await createClient()

    const { imageUrls } = await uploadImage(
      [body.get('avatar')] as File[],
      supabase,
      body.get('email') as string
    )

    return successResponse({
      message: 'Successfully upload image',
      url: imageUrls[0]
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
