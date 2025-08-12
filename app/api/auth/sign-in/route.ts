import { NextRequest } from 'next/server'
import {
  successResponse,
  unauthorizedResponse,
  generalErrorResponse,
  badRequestResponse
} from '@/app/api/helpers/response'
import { SignIn, UserForm } from '@/lib/types/users'
import { createClient } from '@/config'
import { isEmpty } from 'lodash'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SignIn
    const supabase = await createClient()

    if (isEmpty(body)) {
      return badRequestResponse()
    }

    const { data: foundUser, error: foundUserError } = await supabase
      .from('users')
      .select('email')
      .or(`username.eq.${body.username}`)
      .limit(1)
      .single()

    if (foundUserError) {
      return unauthorizedResponse({ error: foundUserError?.message })
    }

    if (!foundUser) {
      return unauthorizedResponse({ error: 'Invalid credentials' })
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email: foundUser?.email as string,
      password: body.password as string
    })

    if (error || !data.session) {
      return unauthorizedResponse({
        error: error?.message || 'Invalid credentials'
      })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, email, employee_id, avatar')
      .eq('id', data.user?.id)
      .single()

    if (userError) {
      return unauthorizedResponse({ error: userError?.message })
    }

    return successResponse({
      message: 'Signed in successfully',
      data: { ...userData, id: data.user?.id } as UserForm
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
