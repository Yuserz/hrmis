import { Users } from '@/lib/types/users'
import {
  badRequestResponse,
  generalErrorResponse,
  successResponse,
  validationErrorNextResponse
} from '../../helpers/response'
import { paginatedData } from '../../helpers/paginated-data'
import { createClient } from '@/config'
import { NextRequest } from 'next/server'
import { isEmpty } from 'lodash'
import { signUp, updatePassword, verifyEmail } from '../model/user'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const url = req.nextUrl.searchParams

    const page = Number(url.get('page') || 1)
    const perPage = Number(url.get('perPage') || 10)
    const sortBy = url.get('sortBy') || 'created_at'
    const search = url.get('search') || ''

    const { data, error, count, totalPages, currentPage } =
      await paginatedData<Users>(
        'users',
        supabase,
        'id, employee_id, username, email, role, avatar, created_at, updated_at, archived_at',
        { column: 'username', query: search },
        page,
        perPage,
        sortBy
      )

    if (error) {
      return badRequestResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully fetched users',
      data: {
        users: data,
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

  if (body.type === 'sign-up') {
    return signUp(body)
  }

  if (body.type === 'verify-email') {
    return verifyEmail(body.email, req.headers.get('referer') as string)
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json()

  if (isEmpty(body)) {
    return validationErrorNextResponse()
  }

  if (body.type === 'update-password') {
    return updatePassword(body.password)
  }
}
