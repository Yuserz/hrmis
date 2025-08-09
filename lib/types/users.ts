import { Database } from './db-types'

type Users = Database['public']['Tables']['users']['Row']

export type UserForm = Omit<Users, 'created_at' | 'updated_at'>

export interface SignIn extends Pick<UserForm, 'email'> {
  password: string
}
