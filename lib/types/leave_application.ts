import { Database } from './db-types'
import { Users } from './users'
import { LeaveCategories } from './leave_categories'

export type LeaveApplications =
  Database['public']['Tables']['leave_applications']['Row']

export type LeaveApplicationsData = Omit<
  LeaveApplications,
  'user_id' | 'leave_id'
>

export interface LeaveApplicationsForm extends LeaveApplicationsData {
  users: Pick<Users, 'email' | 'username'>
  leave_categories: Pick<LeaveCategories, 'name'>
}
