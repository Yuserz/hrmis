import { client } from '@/app/api/axios-client'
import { AxiosResponse } from 'axios'
import axios from 'axios'
import { Users } from '@/lib/types/users'

export const fetchUsers = async (): Promise<Users[] | undefined> => {
  try {
    const response = await client().get<AxiosResponse<Users[]>>(
      '/api/protected/users?page=1&perPage=10&sortBy=created_at'
    )

    return response.data.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw e.response?.data.error
    }
  }
}
