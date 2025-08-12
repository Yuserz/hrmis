import { AxiosService } from '@/app/api/axios-client'
import { AxiosResponse } from 'axios'
import axios from 'axios'
import { Users } from '@/lib/types/users'

export const fetchUsers = async (
  params: string
): Promise<Users[] | undefined> => {
  try {
    const response = await AxiosService.get<AxiosResponse<Users[]>>(
      `/api/protected/users${params}`
    )

    return response.data.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw e.response?.data.error
    }
  }
}
