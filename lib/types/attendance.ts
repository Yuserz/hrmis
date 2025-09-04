import { Database } from './db-types'
import { Users } from './users'

export type Attendance = Database['public']['Tables']['attendance']['Row']

export interface AttendanceDB extends Omit<Attendance, 'archived_at'> {
  users: Pick<Users, 'id' | 'email' | 'username' | 'employee_id'>
}
