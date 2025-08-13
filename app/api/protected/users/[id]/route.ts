import { Users } from '@/lib/types/users'
import {
  successResponse,
  unauthorizedResponse,
  generalErrorResponse,
  badRequestResponse,
  validationErrorNextResponse,
  conflictRequestResponse
} from '@/app/api/helpers/response'
import { isEmpty } from 'lodash'
import { getImagePath, removeImageViaPath } from '@/app/api/helpers/image/image'
import { createClient } from '@/config'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select(
        'id, employee_id, username, email, role, avatar, created_at, updated_at, archived_at'
      )
      .is('archived_at', null)
      .eq('id', body.userId)
      .overrideTypes<Users>()

    if (error) {
      return badRequestResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully fetched user',
      data
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json()
    const { id: userId } = await params
    const isEqualAvatar = body.oldAvatar !== body.avatar
    const supabase = await createClient()

    if (isEmpty(body)) {
      return validationErrorNextResponse()
    }

    //remove old avatar
    if (isEqualAvatar) {
      removeImageViaPath(supabase, getImagePath(body.oldAvatar as string))
    }

    const { data: foundUser, error: foundUserError } = await supabase
      .from('users')
      .select('email')
      .or(`username.eq.${body.username}`)
      .limit(1)
      .maybeSingle()

    if (foundUserError) {
      if (typeof body.avatar === 'string') {
        removeImageViaPath(supabase, getImagePath(body.avatar as string))
      }

      return unauthorizedResponse({ error: foundUserError?.message })
    }

    if (foundUser) {
      if (typeof body.avatar === 'string') {
        removeImageViaPath(supabase, getImagePath(body.avatar as string))
      }

      return conflictRequestResponse({
        error: 'username already exist please try again.'
      })
    }

    const newData = {
      username: body.username,
      role: body.role,
      avatar: body.avatar
    }

    const { error: userError } = await supabase
      .from('users')
      .update(newData)
      .eq('id', userId)

    if (userError) {
      if (typeof body.avatar === 'string') {
        removeImageViaPath(supabase, getImagePath(body.avatar as string))
      }
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
