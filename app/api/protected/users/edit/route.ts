import {
  successResponse,
  unauthorizedResponse,
  generalErrorResponse,
  badRequestResponse,
  validationErrorNextResponse,
  conflictRequestResponse
} from '@/app/api/helpers/response'
import { getImagePath, removeImageViaPath } from '@/app/api/helpers/image/image'
import { createClient } from '@/config'
import { isEmpty } from 'lodash'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    if (isEmpty(body)) {
      return validationErrorNextResponse()
    }

    //remove old avatar
    if (body.oldAvatar) {
      removeImageViaPath(supabase, getImagePath(body.oldAvatar as string))
    }

    const { data: foundUser, error: foundUserError } = await supabase
      .from('users')
      .select('email')
      .or(`username.eq.${body.username}`)
      .limit(1)
      .maybeSingle()

    if (foundUserError) {
      removeImageViaPath(supabase, getImagePath(body.avatar as string))
      return unauthorizedResponse({ error: foundUserError?.message })
    }

    if (foundUser) {
      removeImageViaPath(supabase, getImagePath(body.avatar as string))
      return conflictRequestResponse({
        error: 'username already exist please try again.'
      })
    }

    const { error: userError } = await supabase
      .from('users')
      .update({
        employee_id: body.employee_id as string,
        role: body.role as string,
        username: body.username as string,
        avatar: body.avatar as string
      })
      .eq('id', body.userId as string)

    if (userError) {
      removeImageViaPath(supabase, getImagePath(body.avatar as string))
      return badRequestResponse({ error: userError.message || '' })
    }

    return successResponse({
      message: 'Successfully updated user details.'
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
