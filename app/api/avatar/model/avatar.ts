import { createClient } from '@/config'
import { uploadImage } from '../../helpers/image/image'
import { successResponse, generalErrorResponse } from '../../helpers/response'

export const uploadAvatar = async (body: FormData) => {
  try {
    const supabase = await createClient()

    const { imageUrls, error } = await uploadImage(
      [body.get('avatar')] as File[],
      supabase,
      body.get('email') as string
    )

    if (error) {
      return error
    }

    return successResponse({
      message: 'Successfully upload image',
      url: imageUrls[0]
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
