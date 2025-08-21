import { NextRequest } from 'next/server'
import { createClient } from '@/config'
import { paginatedData } from '../../helpers/paginated-data'
import {
  badRequestResponse,
  successResponse,
  generalErrorResponse,
  validationErrorNextResponse
} from '../../helpers/response'
import { isEmpty } from 'lodash'
import { LeaveApplications } from '@/lib/types/leave_application'
import { addLeaveRequest } from '../model/leave_applications'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const url = req.nextUrl.searchParams

    const page = Number(url.get('page') || 1)
    const perPage = Number(url.get('perPage') || 10)
    const sortBy = url.get('sortBy') || 'created_at'
    const search = url.get('search') || ''

    const { data, error, count, totalPages, currentPage } =
      await paginatedData<LeaveApplications>(
        'leave_applications',
        supabase,
        'id, users!inner(email, username, id), leave_categories(name, id), start_date, end_date, status, remarks, created_at, updated_at, archived_at',
        { column: 'users.email', query: search },
        page,
        perPage,
        sortBy
      )

    if (error) {
      return badRequestResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully fetched leave applications',
      data: {
        leave_applications: data,
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

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (isEmpty(body)) {
    return validationErrorNextResponse()
  }

  if (body.type === 'add-leave-request') {
    return addLeaveRequest(body.data)
  }
}
