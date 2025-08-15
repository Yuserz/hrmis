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

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ page: string; search: string }>
}): Promise<JSX.Element> {
  const { page, search } = await searchParams
  const response = await fetchUsers(
    `?page=${page}&perPage=2&search=${search}&sortBy=created_at`
  )

  return (
    <Container
      title='User Managament'
      description='You can manage users here (e.g., add, edit, delete, ban)'
    >
      <UsersTable
        {...{
          users: (response?.users as Users[]) || [],
          totalPages: response?.totalPages as number,
          currentPage: response?.currentPage as number,
          count: response?.count as number
        }}
      />

      {/*User Dialogs*/}
      <AddUserDialog />
      <EditUserDialog />
      <RevokedReinstateDialog />
      <UpdatePassword />
      <VerifyEmail />
    </Container>
  )
}
