import { Database } from './db-types'

export type Users = Database['public']['Tables']['users']['Row']

export type UserForm = Omit<
  Users,
  'created_at' | 'updated_at' | 'archived_at'
> & {
  password?: string
}

export interface SignIn extends Pick<UserForm, 'username'> {
  password: string
}
