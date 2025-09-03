import { Database } from './db-types'

export type Biometrics = Database['public']['Tables']['biometrics']['Row']

export type BiometricsDB = Pick<
  Biometrics,
  'id' | 'employee_id' | 'timestamp' | 'type'
>
