import { JSX } from 'react'
import { UsersTable } from './components/UsersTable'
import { AddUserDialog } from './components/add-user-dialog'
import { Container } from '@/components/custom/Container'
import { fetchUsers } from '@/services/users/users.services'
import { Users } from '@/lib/types/users'

export default async function UsersPage(): Promise<JSX.Element> {
  const users = await fetchUsers()

  return (
    <Container
      title='User Managament'
      description='You can manage users here (e.g., add, edit, delete, ban)'
    >
      <UsersTable users={users as Users[]} />
      <AddUserDialog />
    </Container>
  )
}
