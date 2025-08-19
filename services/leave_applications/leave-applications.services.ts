import axios from 'axios'
import { axiosService } from '@/app/api/axios-client'
import { LeaveStatus } from '@/lib/types/leave_application'
import { toast } from 'sonner'

export const getLeaveApplications = async (params: string) => {
  try {
    const response = await axiosService.get(
      `/api/protected/leave_application${params}`
    )

    return response.data.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw e.response?.data.error
    }
  }
}

export const approveDisapprovestatus = async (
  status: LeaveStatus,
  id: string
) => {
  try {
    const response = await axiosService.put(
      `/api/protected/leave_application/${id}`,
      {
        status,
        type: 'update-leave-status'
      }
    )

    toast('Successfully', {
      description: response.data.message
    })
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw e.response?.data.error
    }
  }
}

export const deleteLeaveRequest = async (id: string) => {
  try {
    const response = await axiosService.delete(
      `/api/protected/leave_application/${id}`
    )

    toast('Successfully', {
      description: response.data.message
    })
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw e.response?.data.error
    }
  }
}
