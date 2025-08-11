import { Users } from '@/lib/types/users'
import {
  badRequestResponse,
  generalErrorResponse,
  successResponse
} from '../helpers/response'
import { createClient } from '@/config'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select(
        'id, employee_id, username, email, role, avatar, created_at, updated_at, archived_at'
      )
      .is('archived_at', null)
      .overrideTypes<Users[]>()

    if (error) {
      return badRequestResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully fetched users',
      data
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
