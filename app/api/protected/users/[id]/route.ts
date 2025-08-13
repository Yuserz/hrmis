import { Users } from '@/lib/types/users'
import {
  successResponse,
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json()
    const { id } = await params
    const supabase = await createClient()

    if (isEmpty(id)) {
      return badRequestResponse()
    }

    const { error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: body.banUntil
    })

    if (error) {
      return generalErrorResponse()
    }

    const { error: userError } = await supabase.from('users').update({
      archived_at: body.archivedAt
    })

    if (userError) {
      return generalErrorResponse()
    }

    return successResponse({
      message: 'Successfuly revoked user'
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
    const isEqualAvatar = body.oldAvatar !== body.avatar && !!body.oldAvatar
    const supabase = await createClient()

    if (isEmpty(body)) {
      return validationErrorNextResponse()
    }

    //remove old avatar
    if (isEqualAvatar) {
      removeImageViaPath(supabase, getImagePath(body.oldAvatar as string))
    }

    const newData = {
      username: body.username,
      role: body.role,
      avatar: body.avatar,
      employee_id: body.employee_id
    }

    const { error: userError } = await supabase
      .from('users')
      .update(newData)
      .eq('id', userId)

    if (
      userError?.message ===
      'duplicate key value violates unique constraint "users_username_key"'
    ) {
      return conflictRequestResponse({
        error: 'username already exist, please try again.'
      })
    }

    if (userError) {
      if (typeof body.oldAvatar === 'string') {
        removeImageViaPath(supabase, getImagePath(body.oldAvatar as string))
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
