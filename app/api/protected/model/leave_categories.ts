import { generalErrorResponse, successResponse } from '../../helpers/response'
import { createClient } from '@/config'

export const addLeaveCategories = async (name: string) => {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('leave_categories').insert({ name })

    if (error) {
      return generalErrorResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfuly added category'
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}

export const editLeaveCategories = async (
  data: { [key: string]: string | Date },
  id: string
) => {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('leave_categories')
      .update(data)
      .eq('id', id)

    if (error) {
      return generalErrorResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfuly updated category'
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
