import { Users } from '@/lib/types/users'
import {
  badRequestResponse,
  generalErrorResponse,
  successResponse
} from '../../helpers/response'
import { paginatedData } from '../../helpers/paginated-data'
import { createClient } from '@/config'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const url = new URL(req.url)

    const page = Number(url.searchParams.get('page') || 1)
    const perPage = Number(url.searchParams.get('perPage') || 10)
    const sortBy = url.searchParams.get('sortBy') || 'created_at'

    const { data, error } = await paginatedData<Users>(
      'users',
      supabase,
      'id, employee_id, username, email, role, avatar, created_at, updated_at, archived_at',
      page,
      perPage,
      sortBy
    )

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
