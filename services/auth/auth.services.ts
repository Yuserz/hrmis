import axios from 'axios'
import { AxiosResponse } from 'axios'
import { AxiosService } from '@/app/api/axios-client'
import { toast } from 'sonner'
import { UserForm } from '@/lib/types/users'
import { isEmpty } from 'lodash'

interface UserFormData extends UserForm {
  avatar: File[]
}

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
  role,
  avatar
}: UserFormData): Promise<UserForm | undefined> => {
  try {
    const formData = new FormData()
    formData.append('avatar', avatar[0])
    formData.append('email', email as string)

    let responseImage: AxiosResponse | null = null

    if (avatar.length > 0) {
      responseImage = await AxiosService.post('/api/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    const response = await AxiosService.post<AxiosResponse<UserForm>>(
      '/api/protected/users/sign-up',
      {
        email,
        username,
        password,
        employee_id: isEmpty(employee_id) ? null : employee_id,
        role,
        avatar: responseImage?.data.url ?? null
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
