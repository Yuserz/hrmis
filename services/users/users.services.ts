import axios from 'axios'
import { toast } from 'sonner'
import { AxiosResponse } from 'axios'
import { axiosService } from '@/app/api/axios-client'
import { UserForm, Users } from '@/lib/types/users'
import { isArray, isEmpty } from 'lodash'

interface UserFormData extends UserForm {
  avatar: File[]
}

interface UpdateUserInfo
  extends Pick<Users, 'id' | 'username' | 'employee_id' | 'role' | 'email'> {
  avatar: File[]
  oldAvatar: string
}

export const revokeOrReinstate = async (
  archivedAt: Date | null,
  banUntil: string,
  id: string
): Promise<void> => {
  try {
    await axiosService.post<AxiosResponse<UserForm>>(
      `/api/protected/users/${id}`,
      {
        archivedAt,
        banUntil
      }
    )

    toast('Successfully', {
      description: 'Successfully updated user'
    })
  } catch (e) {
    if (axios.isAxiosError(e)) {
      toast.error('ERROR!', {
        description: e.response?.data.error
      })
      throw e.response?.data.error
    }
  }
}

export const updateUserInfo = async ({
  id,
  username,
  employee_id,
  role,
  email,
  avatar,
  oldAvatar
}: UpdateUserInfo): Promise<void> => {
  try {
    const formData = new FormData()
    formData.append('avatar', avatar[0])
    formData.append('email', email as string)

    let responseImage: AxiosResponse | null = null

    if (isArray(avatar)) {
      responseImage = await axiosService.post('/api/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    await axiosService.put<AxiosResponse<UserForm>>(
      `/api/protected/users/${id}`,
      {
        userId: id,
        email,
        username,
        employee_id: isEmpty(employee_id) ? null : employee_id,
        role,
        avatar: responseImage?.data.url ?? avatar,
        oldAvatar: oldAvatar ?? null
      }
    )

    toast('Successfully', {
      description: 'Successfully updated user'
    })
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
      responseImage = await axiosService.post('/api/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    const response = await axiosService.post<AxiosResponse<UserForm>>(
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

export const fetchUsers = async (
  params: string
): Promise<Users[] | undefined> => {
  try {
    const response = await axiosService.get<AxiosResponse<Users[]>>(
      `/api/protected/users${params}`
    )

    return response.data.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw e.response?.data.error
    }
  }
}
