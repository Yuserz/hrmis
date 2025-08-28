import { Database } from './db-types'
import { Users } from './users'

export type LeaveCredits = Database['public']['Tables']['leave_credits']['Row']

export interface LeaveCreditsForm extends LeaveCredits {
  users: Users
}
