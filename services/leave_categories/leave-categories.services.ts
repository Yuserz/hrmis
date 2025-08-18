import axios from 'axios'
import { toast } from 'sonner'
import { axiosService } from '@/app/api/axios-client'
import { UserForm } from '@/lib/types/users'

export const getLeaveCategories = async (params: string) => {
  try {
    const response = await axiosService.get(
      `/api/protected/leave_categories${params}`
    )

    return response.data.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw e.response?.data.error
    }
  }
}

export const addLeaveCategories = async (
  name: string
): Promise<UserForm | undefined> => {
  try {
    const response = await axiosService.post(
      '/api/protected/leave_categories',
      {
        name,
        type: 'add-leave-categories'
      }
    )

    toast('Successfully', {
      description: response.data.message
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

export const deleteLeaveCategories = async (id: string): Promise<void> => {
  try {
    await axiosService.delete(`/api/protected/leave_categories/${id}`)

    toast('Successfully', {
      description: 'Successfully Delete categories.'
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

export const editLeaveCategories = async (data: { [key: string]: string }) => {
  try {
    const response = await axiosService.put(
      `/api/protected/leave_categories/${data.id}`,
      {
        name: data.name,
        type: 'edit-leave-categories'
      }
    )

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
