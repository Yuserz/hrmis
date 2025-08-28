import { NextRequest } from 'next/server'
import { createClient } from '@/config'
import { paginatedData } from '../../helpers/paginated-data'
import {
  successResponse,
  badRequestResponse,
  generalErrorResponse
} from '../../helpers/response'
import { LeaveCreditsForm } from '@/lib/types/leave_credits'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const url = req.nextUrl.searchParams

    const page = Number(url.get('page') || 1)
    const perPage = Number(url.get('perPage') || 10)
    const sortBy = url.get('sortBy') || 'created_at'
    const search = url.get('search') || ''

    const { data, error, count, totalPages, currentPage } =
      await paginatedData<LeaveCreditsForm>(
        'leave_credits',
        supabase,
        'id, credits, users!inner(id, avatar, email, username, role, employee_id, created_at, updated_at, archived_at), created_at, updated_at, archived_at',
        { column: 'users.email', query: search },
        page,
        perPage,
        sortBy
      )

    if (error) {
      return badRequestResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully fetched user credits',
      data: {
        user_credits: data,
        count,
        totalPages,
        currentPage
      }
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
