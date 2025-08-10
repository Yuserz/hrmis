import axios, { AxiosError } from 'axios'
import { AxiosResponse } from 'axios'
import { toast } from 'sonner'
import { UserForm } from '@/lib/types/users'
import { permanentRedirect } from 'next/navigation'

export const signIn = async (
  email: string,
  password: string
): Promise<UserForm | undefined> => {
  try {
    const response = await axios.post<AxiosResponse<UserForm>>(
      '/api/auth/sign-in',
      {
        email,
        password
      }
    )

    return response.data.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      toast.error('ERROR!', {
        description: e.response?.data.error
      })
      throw e.response?.data.error
    }
  }
}

export const signOut = async (): Promise<void> => {
  try {
    await axios.post<{
      data: UserForm
      error: AxiosError
    }>('/api/auth/sign-out')

    permanentRedirect('/auth/sign-in')
  } catch (e) {
    if (axios.isAxiosError(e)) {
      toast.error('ERROR!', {
        description: e.response?.data.error
      })
      throw e.response?.data.error
    }
  }
}
