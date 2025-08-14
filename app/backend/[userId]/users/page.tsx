import { JSX } from 'react'
import { fetchUsers } from '@/services/users/users.services'
import { Users } from '@/lib/types/users'
import { RevokedReinstateDialog } from './components/revoke-reinstate-dialog'
import { UsersTable } from './components/UsersTable'
import { EditUserDialog } from './components/edit-user-dialog'
import { AddUserDialog } from './components/add-user-dialog'
import { Container } from '@/components/custom/Container'
import { UpdatePassword } from './components/update-password-dialog'
import { VerifyEmail } from './components/verify-email-dialog'

export default async function UsersPage(): Promise<JSX.Element> {
  const users = await fetchUsers('?page=1&perPage=2&sortBy=created_at')

  return (
    <Container
      title='User Managament'
      description='You can manage users here (e.g., add, edit, delete, ban)'
    >
      <UsersTable users={(users as Users[]) || []} />

      {/*User Dialogs*/}
      <AddUserDialog />
      <EditUserDialog />
      <RevokedReinstateDialog />
      <UpdatePassword />
      <VerifyEmail />
    </Container>
  )
}
