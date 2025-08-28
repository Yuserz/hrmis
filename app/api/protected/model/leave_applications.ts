import { LeaveApplications, LeaveStatus } from '@/lib/types/leave_application'
import {
  conflictRequestResponse,
  generalErrorResponse,
  successResponse
} from '../../helpers/response'
import { createClient } from '@/config'

type LeaveApplicationRequest = Omit<
  LeaveApplications,
  'created_at' | 'updated_at' | 'archived_at'
>

export const addLeaveRequest = async (
  data: LeaveApplicationRequest,
  credsCount: number
) => {
  try {
    const supabase = await createClient()

    const { data: leaveCreds, error: leaveCredsError } = await supabase
      .from('leave_credits')
      .select('id, credits')
      .eq('user_id', data?.user_id)
      .maybeSingle()

    if (leaveCredsError) {
      return generalErrorResponse({ error: leaveCredsError.message })
    }

    if (credsCount > leaveCreds?.credits) {
      return conflictRequestResponse({ error: 'Not enough credits, try again' })
    }

    const { error } = await supabase.from('leave_applications').insert(data)

    if (error) {
      return generalErrorResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully added leave request.'
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}

export const editLeaveRequest = async (
  data: LeaveApplicationRequest,
  id: string
) => {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('leave_applications')
      .update(data)
      .eq('id', id)

    if (error) {
      return generalErrorResponse({ error: error.message })
    }

    return successResponse({
      message: 'Successfully updated leave request.'
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}

export const approveDisapproveLeave = async (
  status: LeaveStatus,
  userId: string,
  id: string,
  countDates: number
) => {
  try {
    const supabase = await createClient()

    if (status === 'disapproved') {
      const { error: errorCredits } = await supabase.rpc(
        'increment_update_credits',
        {
          p_user_id: userId,
          count_dates: countDates
        }
      )

      if (errorCredits) {
        return generalErrorResponse({ error: errorCredits })
      }
    }

    if (status === 'approved') {
      const { error: errorCredits } = await supabase.rpc(
        'decrement_update_credits',
        {
          p_user_id: userId,
          count_dates: countDates
        }
      )

      if (errorCredits?.message === 'User no longer have leave credits left') {
        return conflictRequestResponse({
          error: errorCredits?.message
        })
      }

      if (errorCredits?.message === 'Not enough leave credits, try again') {
        return conflictRequestResponse({
          error: errorCredits?.message
        })
      }

      if (errorCredits) {
        return generalErrorResponse({ error: errorCredits })
      }
    }

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
