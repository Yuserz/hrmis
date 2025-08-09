import { NextRequest } from 'next/server'
import {
  successResponse,
  unauthorizedResponse,
  generalErrorResponse
} from '@/app/api/helpers/response'
import { SignIn } from '@/lib/types/users'
import { createClient } from '@/config'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SignIn
    const supabase = await createClient()

    const { error, data } = await supabase.auth.signInWithPassword({
      email: body.email as string,
      password: body.password as string
    })

    if (error || !data.session) {
      return unauthorizedResponse({
        error: error?.message || 'Invalid credentials'
      })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, email, employee_id, avatar, created_at, updated_at')
      .eq('id', data.user?.id)
      .single()

    if (userError) {
      return unauthorizedResponse({ error: userError?.message })
    }

    return successResponse({
      message: 'Signed in successfully',
      data: { ...userData, id: data.user?.id }
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
