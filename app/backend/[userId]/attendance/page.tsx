import { JSX } from 'react'
import { UploadDialog } from './components/UploadDialog'
import { AttendanceTable } from './components/AttendanceTable'
import { Container } from '@/components/custom/Container'
import { getAttendance } from '@/services/attendance/attendance.services'

export default async function AttendancePage({
  searchParams
}: {
  searchParams: Promise<{ page: string; search: string }>
}): Promise<JSX.Element> {
  const { page, search } = await searchParams
  const response = await getAttendance(
    `?page=${page || 1}&perPage=10&search=${search}&sortBy=created_at`
  )

  return (
    <Container
      title='Attendance'
      description='You can see all employee attendance here'
    >
      <AttendanceTable
        {...{
          data: response.attendance,
          totalPages: response?.totalPages as number,
          currentPage: response?.currentPage as number,
          count: response?.count as number
        }}
      />

      <UploadDialog />
    </Container>
  )
}
