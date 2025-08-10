import { UserForm } from '@/lib/types/users'
import { generalErrorResponse } from '../../helpers/response'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as UserForm
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
