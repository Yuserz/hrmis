import { createClient } from '@/config'
import {
  generalErrorResponse,
  successResponse,
  unauthorizedResponse
} from '../../helpers/response'
import { SignIn, UserForm } from '@/lib/types/users'

export const signIn = async (body: SignIn) => {
  try {
    const supabase = await createClient()

    const { data: foundUser, error: foundUserError } = await supabase
      .from('users')
      .select('email')
      .is('archived_at', null)
      .or(`username.eq.${body.username}`)
      .limit(1)
      .single()

    if (
      foundUserError?.message ===
      'JSON object requested, multiple (or no) rows returned'
    ) {
      return unauthorizedResponse({
        error: 'Something went wrong to your account, please contact support.'
      })
    }

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
      .select('role, email, employee_id')
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

export const signOut = async () => {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw generalErrorResponse({ error: error.message })
    }

    return successResponse({ message: 'Signout successfully' })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
