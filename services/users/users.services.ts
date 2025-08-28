import axios from 'axios'
import { toast } from 'sonner'
import { AxiosResponse } from 'axios'
import { axiosService } from '@/app/api/axios-client'
import { UserForm, Users } from '@/lib/types/users'
import { isArray, isEmpty } from 'lodash'
import { Pagination } from '@/lib/types/pagination'

interface UserFormData extends UserForm {
  avatar: File[]
}

interface UsersResponse extends Pagination {
  users: Users[]
}

interface UpdateUserInfo
  extends Pick<Users, 'id' | 'username' | 'employee_id' | 'role' | 'email'> {
  avatar: File[]
  oldAvatar: string
}

export const updatePassword = async (password: string) => {
  try {
    const response = await axiosService.put('/api/protected/users', {
      password,
      type: 'update-password'
    })

    toast('Successfully', {
      description: response.data.message
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

export const verifyEmail = async (email: string) => {
  try {
    const response = await axiosService.post('/api/protected/users', {
      email,
      type: 'verify-email'
    })

    return response.data.path
  } catch (e) {
    if (axios.isAxiosError(e)) {
      toast.error('ERROR!', {
        description: e.response?.data.error
      })
      throw e.response?.data.error
    }
  }
}

export const revokeOrReinstate = async (
  archivedAt: Date | null,
  banUntil: string,
  id: string
): Promise<void> => {
  try {
    const response = await axiosService.put(`/api/protected/users/${id}`, {
      archivedAt,
      banUntil,
      type: 'banned-until'
    })

    toast('Successfully', {
      description: response.data.message
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
    let responseImage: AxiosResponse | null = null

    if (isArray(avatar)) {
      const formData = new FormData()
      formData.append('email', email as string)
      formData.append('type', 'upload-avatar')
      formData.append('avatar', avatar[0])

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
        oldAvatar: oldAvatar ?? null,
        type: 'update-user-info'
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
    formData.append('type', 'upload-avatar')

    let responseImage: AxiosResponse | null = null

    if (avatar.length > 0) {
      responseImage = await axiosService.post('/api/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    const response = await axiosService.post<AxiosResponse<UserForm>>(
      '/api/protected/users',
      {
        email,
        username,
        password,
        employee_id: isEmpty(employee_id) ? null : employee_id,
        role,
        avatar: responseImage?.data.url ?? null,
        type: 'sign-up'
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
): Promise<UsersResponse | undefined> => {
  try {
    const response = await axiosService.get(`/api/protected/users${params}`)

    return response.data.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw e.response?.data.error
    }
  }
}
