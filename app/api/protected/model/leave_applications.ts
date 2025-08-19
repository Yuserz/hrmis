import { LeaveStatus } from '@/lib/types/leave_application'
import { generalErrorResponse, successResponse } from '../../helpers/response'
import { createClient } from '@/config'

export const approveDisapproveLeave = async (
  status: LeaveStatus,
  id: string
) => {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('leave_applications')
      .update({
        status
      })
      .eq('id', id)

    if (error) {
      return generalErrorResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully updated leave status.'
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}

export const deleteLeaveRequest = async (id: string) => {
  try {
    const supabase = await createClient()
    const today = new Date()

    const { error } = await supabase
      .from('leave_applications')
      .update({
        archived_at: today
      })
      .eq('id', id)

    if (error) {
      return generalErrorResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully deleted leave request.'
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
