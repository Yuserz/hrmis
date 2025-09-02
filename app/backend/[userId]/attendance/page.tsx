import { JSX } from 'react'
import { AttendanceTable } from './components/AttendanceTable'
import { Container } from '@/components/custom/Container'

export default async function AttendancePage(): Promise<JSX.Element> {
  return (
    <Container
      title='Attendance'
      description='You can see all employee attendance here'
    >
      <AttendanceTable
        {...{ data: [], totalPages: 1, currentPage: 1, count: 1 }}
      />
    </Container>
  )
}
