import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

export const paginatedData = async <TData>(
  tableName: string,
  supabase: SupabaseClient,
  columns: string,
  search: {
    column: string
    query: string
  },
  page?: number,
  perPage?: number,
  sortBy?: string,
  sortOrder = 'asc'
): Promise<{
  data: TData[] | null
  error: PostgrestError | null
  totalPages: number
  currentPage: number
  count: number | null
}> => {
  let query = supabase.from(tableName).select(columns, { count: 'exact' })

  if (search && search.column && search.query !== 'undefined') {
    query = query.ilike(search.column, `%${search.query}%`)
  }

  if (sortBy) {
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
  }

  const from = ((page as number) - 1) * (perPage as number)
  const to = from + (perPage as number) - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  const totalPages = Math.ceil(Number(count) / Number(perPage))

  return {
    data: data as TData[],
    totalPages,
    currentPage: page as number,
    error,
    count
  }
}
