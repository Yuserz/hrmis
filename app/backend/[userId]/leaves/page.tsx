import { JSX } from 'react'
import { FileLeaveDialog } from './components/FileLeaveDialog'
import { ApproveDisapproveDialog } from './components/ApprovedDisapprovedStatus'
import { EditFileLeaveDialog } from './components/EditLeaveRequestDialog'
import { DeleteLeaveRequestDialog } from './components/DeleteDialog'
import { Container } from '@/components/custom/Container'
import { LeaveApplicationsTable } from './components/LeaveApplicationsTable'
import { LeaveApplicationsForm } from '@/lib/types/leave_application'
import { getLeaveApplications } from '@/services/leave_applications/leave-applications.services'
import { getLeaveCategories } from '@/services/leave_categories/leave-categories.services'

export default async function Leaves({
  searchParams
}: {
  searchParams: Promise<{ page: string; search: string }>
}): Promise<JSX.Element> {
  const { page, search } = await searchParams

  const response = await getLeaveApplications(
    `?page=${page}&perPage=10&search=${search}&sortBy=created_at`
  )

  const category = await getLeaveCategories(
    `?&search=${search}&sortBy=created_at`
  )

  return (
    <Container
      title='Leave Applications'
      description='You can see and all filed leaves here.'
    >
      <>
        <LeaveApplicationsTable
          {...{
            leave_applications:
              response.leave_applications as LeaveApplicationsForm[],
            totalPages: response?.totalPages as number,
            currentPage: response?.currentPage as number,
            count: response?.count as number
          }}
        />

        <FileLeaveDialog category={category.leave_categories} />
        <EditFileLeaveDialog category={category.leave_categories} />
        <ApproveDisapproveDialog />
        <DeleteLeaveRequestDialog />
      </>
    </Container>
  )
}
