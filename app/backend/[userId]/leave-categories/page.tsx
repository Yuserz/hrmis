import { JSX } from 'react'
import { Container } from '@/components/custom/Container'
import { LeaveCateogriesTable } from './components/LeaveCategoriesTable'
import { AddLeaveCategoriesDialog } from './components/AddCategoriesDialog'
import { EditLeaveCategoriesDialog } from './components/EditCategoriesDialog'
import { getLeaveCategories } from '@/services/leave_categories/leave-categories.services'
import { DeleteLeaveCategoryDialog } from './components/DeleteDialog'
import { LeaveCategories as LeaveCategoriesType } from '@/lib/types/leave_categories'

export default async function LeaveCategories({
  searchParams
}: {
  searchParams: Promise<{ page: string; search: string }>
}): Promise<JSX.Element> {
  const { page, search } = await searchParams
  const response = await getLeaveCategories(
    `?page=${page}&perPage=2&search=${search}&sortBy=created_at`
  )

  return (
    <Container
      title='Leave Categories'
      description='You can add all leave categories here'
    >
      <LeaveCateogriesTable
        {...{
          leave_categories:
            (response?.leave_categories as LeaveCategoriesType[]) || [],
          totalPages: response?.totalPages as number,
          currentPage: response?.currentPage as number,
          count: response?.count as number
        }}
      />

      <AddLeaveCategoriesDialog />
      <EditLeaveCategoriesDialog />
      <DeleteLeaveCategoryDialog />
    </Container>
  )
}
