import { JSX } from 'react'
import { AddUserDialog } from './components/add-user-dialog'
import { UserActions } from './components/UserActions'
import { Container } from '@/components/custom/Container'

export default function Users(): JSX.Element {
  return (
    <Container
      title='User Managament'
      description='You can manage users here (e.g., add, edit, delete, ban)'
    >
      <UserActions />
      users
      <AddUserDialog />
    </Container>
  )
}
