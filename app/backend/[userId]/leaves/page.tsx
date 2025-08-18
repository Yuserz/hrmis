import { getLeaveApplications } from '@/services/leave_applications/leave-applications.services'
import { LeaveApplicationsTable } from './components/LeaveApplicationsTable'
import { JSX } from 'react'
import { LeaveApplicationsForm } from '@/lib/types/leave_application'

export default async function Leaves({
  searchParams
}: {
  searchParams: Promise<{ page: string; search: string }>
}): Promise<JSX.Element> {
  const { page, search } = await searchParams

  const response = await getLeaveApplications(
    `?page=${page}&perPage=2&search=${search}&sortBy=created_at`
  )

  return (
    <div>
      <LeaveApplicationsTable
        {...{
          leave_applications:
            response.leave_applications as LeaveApplicationsForm[],
          totalPages: response?.totalPages as number,
          currentPage: response?.currentPage as number,
          count: response?.count as number
        }}
      />
    </div>
  )
}
