import axios from 'axios'
import { axiosService } from '@/app/api/axios-client'
import { LeaveCreditsForm } from '@/lib/types/leave_credits'
import { Pagination } from '@/lib/types/pagination'

type CreditsForm = LeaveCreditsForm & Pagination

export const fetchUserCredits = async (
  params: string
): Promise<CreditsForm | undefined> => {
  try {
    const response = await axiosService.get(
      `/api/protected/user_credits${params}`
    )

    return response.data.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw e.response?.data.error
    }
  }
}

export const fetchUserWitHCredits = async (id: string) => {
  try {
    const response = await axiosService.get(`/api/protected/user_credits/${id}`)

    return response.data.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw e.response?.data.error
    }
  }
}
