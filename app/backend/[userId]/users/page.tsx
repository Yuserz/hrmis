import { JSX } from 'react'
import { fetchUsers } from '@/services/users/users.services'
import { Users } from '@/lib/types/users'
import { RevokedReinstateDialog } from './components/RevokeReinstateDialog'
import { UsersTable } from './components/UsersTable'
import { EditUserDialog } from './components/EditUserDialog'
import { AddUserDialog } from './components/AddUserDialog'
import { Container } from '@/components/custom/Container'
import { UpdatePassword } from './components/UpdatePasswordDialog'
import { VerifyEmail } from './components/VerifyEmailDialog'

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ page: string; search: string }>
}): Promise<JSX.Element> {
  const { page, search } = await searchParams
  const response = await fetchUsers(
    `?page=${page}&perPage=10&search=${search}&sortBy=created_at`
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
