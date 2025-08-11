import axios from 'axios'
import { AxiosResponse } from 'axios'
import { client } from '@/app/api/axios-client'
import { toast } from 'sonner'
import { UserForm } from '@/lib/types/users'
import { isEmpty } from 'lodash'

export const signIn = async (
  username: string,
  password: string
): Promise<UserForm | undefined> => {
  try {
    const response = await axios.post<AxiosResponse<UserForm>>(
      '/api/auth/sign-in',
      {
        username,
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

export const signUp = async ({
  email,
  username,
  password,
  employee_id,
  role
}: UserForm): Promise<UserForm | undefined> => {
  try {
    const response = await client().post<AxiosResponse<UserForm>>(
      '/api/users/sign-up',
      {
        email,
        username,
        password,
        employee_id: isEmpty(employee_id) ? null : employee_id,
        role
      }
    )

    toast('Successfully', {
      description: 'Successfully created user'
    })

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
    await axios.post('/api/auth/sign-out')
  } catch (e) {
    if (axios.isAxiosError(e)) {
      toast.error('ERROR!', {
        description: e.response?.data.error
      })
      throw e.response?.data.error
    }
  }
}
