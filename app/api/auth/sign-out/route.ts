import {
  successResponse,
  generalErrorResponse
} from '@/app/api/helpers/response'
import { createClient } from '@/config'

export async function POST() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw generalErrorResponse({ error: error.message })
    }

    return successResponse({ message: 'Signout successfully' })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
