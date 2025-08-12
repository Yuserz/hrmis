import { SupabaseClient } from '@supabase/supabase-js'
import { conflictRequestResponse, generalErrorResponse } from '../response'

export const uploadImage = async (
  images: File[],
  supabase: SupabaseClient,
  id: string,
  bucket = 'avatars'
): Promise<{ imageUrls: string[] }> => {
  const imageUrls: string[] = []

  if (images && images.length > 0) {
    for (const image of images) {
      const fileName = image?.name as string
      const storageName = `${id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storageName, image, {
          contentType: 'image/png'
        })

      if (uploadError?.message === 'The resource already exists') {
        throw conflictRequestResponse({ error: uploadError?.message })
      }

      console.log(uploadError)

      if (uploadError) {
        throw generalErrorResponse({ error: uploadError.message })
      }

      // Get public URL for the uploaded image
      const {
        data: { publicUrl }
      } = supabase.storage.from(bucket).getPublicUrl(storageName)

      imageUrls.push(publicUrl)
    }
  }

  return {
    imageUrls
  }
}

export const removeImageUponEdit = async (
  supabase: SupabaseClient,
  path: string,
  bucket = 'avatars'
): Promise<void> => {
  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (uploadError) {
      throw generalErrorResponse({
        error: `Image remove failed: ${uploadError.message}`
      })
    }
  } catch (error) {
    throw error
  }
}

export const removeImage = async (
  images: File[],
  supabase: SupabaseClient,
  id: string,
  bucket = 'avatars'
): Promise<void> => {
  if (images && images.length > 0) {
    for (const image of images) {
      const fileName = image?.name as string
      const storageName = `${id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .remove([storageName])

      if (uploadError) {
        throw generalErrorResponse({
          error: `Image remove failed: ${uploadError.message}`
        })
      }
    }
  }
}
