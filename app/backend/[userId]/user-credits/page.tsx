import { JSX } from 'react'
import { fetchUserCredits } from '@/services/leave_credits/leave_credits.services'
import { Container } from '@/components/custom/Container'

export default async function UserCredits({
  searchParams
}: {
  searchParams: Promise<{ page: string; search: string }>
}): Promise<JSX.Element> {
  const { page, search } = await searchParams
  const response = await fetchUserCredits(
    `?page=${page}&perPage=10&search=${search}&sortBy=created_at`
  )

  console.info(response)
  return (
    <Container
      title='User Credits'
      description='You can track user credits here'
    >
      user credits
    </Container>
  )
}
