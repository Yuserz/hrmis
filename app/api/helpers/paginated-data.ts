import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

export const paginatedData = async <TData>(
  tableName: string,
  supabase: SupabaseClient,
  columns: string,
  page?: number,
  perPage?: number,
  sortBy?: string,
  sortOrder = 'asc'
): Promise<{
  data: TData[] | null
  error: PostgrestError | null
  count: number | null
}> => {
  let query = supabase.from(tableName).select(columns, { count: 'exact' })
  query = query.order(sortBy as string, { ascending: sortOrder === 'asc' })

  const from = ((page as number) - 1) * (perPage as number)
  const to = from + (perPage as number) - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  return {
    data: data as TData[],
    error,
    count
  }
}
