import { NextRequest } from 'next/server'
import {
  validationErrorNextResponse,
  badRequestResponse,
  successResponse,
  generalErrorResponse
} from '../../helpers/response'
import { paginatedData } from '../../helpers/paginated-data'
import { createClient } from '@/config'
import { isEmpty } from 'lodash'
import { addLeaveCategories } from '../model/leave_categories'
import { LeaveCategories } from '@/lib/types/leave_categories'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const url = req.nextUrl.searchParams

    const page = Number(url.get('page') || 1)
    const perPage = Number(url.get('perPage') || 10)
    const sortBy = url.get('sortBy') || 'created_at'
    const search = url.get('search') || ''

    const { data, error, count, totalPages, currentPage } =
      await paginatedData<LeaveCategories>(
        'leave_categories',
        supabase,
        'id, name, created_at, updated_at, archived_at',
        { column: 'name', query: search },
        page,
        perPage,
        sortBy
      )

    if (error) {
      return badRequestResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully fetched leave categories',
      data: {
        leave_categories: data,
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

  if (body.type === 'add-leave-categories') {
    return addLeaveCategories(body.name)
  }
}
