import { removeImageViaPath, getImagePath } from '../../helpers/image/image'
import {
  generalErrorResponse,
  successResponse,
  conflictRequestResponse,
  badRequestResponse,
  unauthorizedResponse
} from '../../helpers/response'
import { createClient } from '@/config'
import { UserForm, Users } from '@/lib/types/users'

interface RevokeUser {
  banUntil: string
  archivedAt: Date | null
}

interface UpdateUserInfo extends UserForm {
  oldAvatar: string
  avatar: string
}

interface SignUp extends Users {
  password: string
}

export const updatePassword = async (password: string) => {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      return generalErrorResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfuly updated password'
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}

export const verifyEmail = async (email: string, pathname: string) => {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${pathname}?password-reset=true`
    })

    if (error) {
      return generalErrorResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfuly verified email',
      path: `${pathname}?password-reset=true`
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}

export const revokeUser = async (
  { banUntil, archivedAt }: RevokeUser,
  id: string
) => {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: banUntil
    })

    if (error) {
      return generalErrorResponse({ error: error.message })
    }

    const { error: userError } = await supabase
      .from('users')
      .update({
        archived_at: archivedAt
      })
      .eq('id', id)

    if (userError) {
      return generalErrorResponse({ error: userError.message })
    }

    return successResponse({
      message: 'Successfuly revoked user'
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}

export const updateUserInfo = async (body: UpdateUserInfo, id: string) => {
  try {
    const supabase = await createClient()
    const isEqualAvatar = body.oldAvatar !== body.avatar && !!body.oldAvatar

    //remove old avatar
    if (isEqualAvatar) {
      removeImageViaPath(supabase, getImagePath(body.oldAvatar as string))
    }

    const newData = {
      username: body.username,
      role: body.role,
      avatar: body.avatar,
      employee_id: body.employee_id,
      email: body.email
    }

    const { error: userError } = await supabase
      .from('users')
      .update(newData)
      .eq('id', id)

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

export const signUp = async (body: SignUp) => {
  try {
    const supabase = await createClient()

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
      removeImageViaPath(supabase, getImagePath(body.avatar as string))
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
        username: body.username as string,
        avatar: body.avatar as string
      },
      { onConflict: 'id' }
    )

    if (userError) {
      if (body.avatar) {
        removeImageViaPath(supabase, getImagePath(body.avatar as string))
      }
      await supabase.auth.admin.deleteUser(data.user.id)
      return badRequestResponse({ error: userError.message || '' })
    }

    const { error: creditUser } = await supabase
      .from('leave_credits')
      .insert({ user_id: data.user.id, credits: 10 })

    if (creditUser) {
      if (body.avatar) {
        removeImageViaPath(supabase, getImagePath(body.avatar as string))
      }
      await supabase.auth.admin.deleteUser(data.user.id)
      return badRequestResponse({ error: creditUser.message || '' })
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
