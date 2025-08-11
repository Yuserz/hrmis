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
      email_confirm: true,
      user_metadata: {
        username: body.username,
        employee_id: body.employee_id,
        role: body.role
      }
    })

    if (error) {
      return conflictRequestResponse({
        error: error?.message
      })
    }

    const { error: userError } = await supabase.from('users').upsert(
      {
        id: data.user.id,
        email: body.email as string,
        employee_id: body.employee_id as string,
        role: body.role as string,
        username: body.username as string
      },
      { onConflict: 'id' }
    )

    if (userError) {
      await supabase.auth.admin.deleteUser(data.user.id)
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
