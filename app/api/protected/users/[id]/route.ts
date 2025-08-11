import { Users } from '@/lib/types/users'
import {
  badRequestResponse,
  generalErrorResponse,
  successResponse
} from '@/app/api/helpers/response'
import { createClient } from '@/config'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select(
        'id, employee_id, username, email, role, avatar, created_at, updated_at, archived_at'
      )
      .is('archived_at', null)
      .eq('id', body.userId)
      .overrideTypes<Users>()

    if (error) {
      return badRequestResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully fetched user',
      data
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
