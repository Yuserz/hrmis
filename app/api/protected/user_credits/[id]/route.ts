import { NextRequest } from 'next/server'
import { createClient } from '@/config'
import {
  successResponse,
  badRequestResponse,
  generalErrorResponse
} from '../../../helpers/response'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: userId } = await params

    const { error, data } = await supabase
      .from('leave_credits')
      .select(
        'id, credits, users!inner(id, email, username, role, employee_id), created_at, updated_at, archived_at'
      )
      .eq('user_id', userId)

    if (error) {
      return badRequestResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully fetched user credits',
      data
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
