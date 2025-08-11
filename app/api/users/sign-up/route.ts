import {
  successResponse,
  unauthorizedResponse,
  generalErrorResponse,
  badRequestResponse,
  validationErrorNextResponse,
  conflictRequestResponse
} from '@/app/api/helpers/response'
import { createClient } from '@/config'
import { isEmpty } from 'lodash'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    if (isEmpty(body)) {
      return validationErrorNextResponse()
    }

    const { data: foundUser, error: foundUserError } = await supabase
      .from('users')
      .select('email')
      .or(`username.eq.${body.username}`)
      .limit(1)
      .maybeSingle()

    if (foundUserError) {
      return unauthorizedResponse({ error: foundUserError?.message })
    }

    if (foundUser) {
      return conflictRequestResponse({
        error: 'username already exist please try again.'
      })
    }

    const { error, data } = await supabase.auth.admin.createUser({
      email: body.email as string,
      password: body.password as string,
      email_confirm: true
    })

    if (error || !data.user) {
      return unauthorizedResponse({
        error: error?.message || 'Invalid credentials'
      })
    }

    const { error: userError } = await supabase
      .from('users')
      .update({
        username: body.username as string,
        employee_id: body.employee_id as string,
        role: body.role as string
      })
      .eq('id', data.user.id)

    if (userError) {
      return badRequestResponse({ error: userError.message })
    }

    return successResponse({
      message: 'Sign up successfully',
      userId: data.user.id
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
