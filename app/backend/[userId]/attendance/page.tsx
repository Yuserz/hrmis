import { JSX } from 'react'
import { Container } from '@/components/custom/Container'

export default async function AttendancePage(): Promise<JSX.Element> {
  return (
    <Container
      title='Attendance'
      description='You can see all employee attendance here'
    >
      attendance
    </Container>
  )
}
