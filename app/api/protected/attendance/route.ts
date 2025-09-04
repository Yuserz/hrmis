import { NextRequest } from 'next/server'
import { createClient } from '@/config'
import { paginatedData } from '../../helpers/paginated-data'
import {
  conflictRequestResponse,
  badRequestResponse,
  generalErrorResponse,
  successResponse
} from '../../helpers/response'
import { AttendanceDB } from '@/lib/types/attendance'
import { processBiometricData, processCSVData } from '../model/attendance'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const url = req.nextUrl.searchParams

    const page = Number(url.get('page') || 1)
    const perPage = Number(url.get('perPage') || 10)
    const sortBy = url.get('sortBy') || 'created_at'
    const search = url.get('search') || ''

    const { data, error, count, totalPages, currentPage } =
      await paginatedData<AttendanceDB>(
        'attendance',
        supabase,
        'id, users!user_id!inner(email, username, id, employee_id), month, days_present, days_absent, created_at, updated_at',
        { column: 'users.email', query: search },
        page,
        perPage,
        sortBy
      )

    if (error) {
      return badRequestResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully fetch attendance',
      data: {
        attendance: data,
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
  const formData = await req.formData()

  if (formData.get('type') === 'upload-csv') {
    const csvFile = formData.get('file') as File | null

    if (!csvFile) {
      return conflictRequestResponse({ error: 'No CSV File uploaded.' })
    }

    const csvText = await csvFile.text()

    return processCSVData(csvText)
  }

  if (formData.get('type') === 'upload-dat') {
    const batFile = formData.get('file') as File | null

    if (!batFile) {
      return conflictRequestResponse({ error: 'No CSV File uploaded.' })
    }

    const batText = await batFile.text()
    return processBiometricData(batText)
  }
}
