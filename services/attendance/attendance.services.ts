import axios from 'axios'
import { axiosService } from '@/app/api/axios-client'
import { toast } from 'sonner'

export type UploadType = 'upload-csv' | 'upload-bat'

export const uploadCSVOrBatFile = async (file: File, type: UploadType) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await axiosService.post(
      '/api/protected/attendance',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    toast('Successfully', {
      description: response.data.message
    })
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response?.data.error === 'Not enough credits, try again') {
        toast.error('ERROR!', {
          description: e.response?.data.error
        })
        return
      }
      throw e.response?.data.error
    }
  }
}
