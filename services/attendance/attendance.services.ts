import axios from 'axios'
import { axiosService } from '@/app/api/axios-client'
import { toast } from 'sonner'

export type UploadType = 'upload-csv' | 'upload-dat'

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
      console.log(e)
      if (
        e.response?.data.error ===
        'insert or update on table \"biometrics\" violates foreign key constraint \"biometrics_employee_id_fkey\"'
      ) {
        toast.error('ERROR!', {
          description:
            'Some users doesnt exist, please verify the list of users registered in the app.'
        })
        return
      }
      throw e.response?.data.error
    }
  }
}
