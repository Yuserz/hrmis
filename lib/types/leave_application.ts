import { Database } from './db-types'
import { Users } from './users'
import { DateRange } from 'react-day-picker'
import { LeaveCategories } from './leave_categories'

export type LeaveApplications =
  Database['public']['Tables']['leave_applications']['Row']

export type LeaveStatus = 'approved' | 'disapproved' | 'pending'

export type LeaveApplicationsData = Omit<
  LeaveApplications,
  'user_id' | 'leave_id'
>

export interface LeaveApplicationsForm extends LeaveApplicationsData {
  users: Pick<Users, 'email' | 'username'>
  leave_categories: Pick<LeaveCategories, 'name'>
}

export interface LeaveApplicationsFormData extends LeaveApplications {
  dateRange: DateRange | undefined
}
