'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table'
import { ChevronDown, Plus, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useLeaveCategoriesDialog } from '@/services/leave_categories/states/leave-categories-dialog'
import { useShallow } from 'zustand/shallow'
import { Pagination } from '@/components/custom/Pagination'
import { Pagination as PaginationType } from '@/lib/types/pagination'
import { useRouter, usePathname } from 'next/navigation'
import { debounce } from 'lodash'
import { LeaveCategories } from '@/lib/types/leave_categories'

interface LeaveTableData extends PaginationType {
  leave_categories: LeaveCategories[]
}

export function LeaveCateogriesTable({
  leave_categories: data,
  totalPages,
  currentPage,
  count
}: LeaveTableData) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const { toggleOpen } = useLeaveCategoriesDialog(
    useShallow((state) => ({ toggleOpen: state.toggleOpenDialog }))
  )

  const pathname = usePathname()
  const router = useRouter()

  const onDebounce = React.useMemo(
    () =>
      debounce((value) => {
        if (!!value) {
          router.replace(`${pathname}?page=${currentPage}&search=${value}`)
          return
        }

        router.replace(`${pathname}?page=${currentPage}`)
      }, 500),
    [pathname, router, currentPage]
  )

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target
    onDebounce(value)
  }

  const columns: ColumnDef<LeaveCategories>[] = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: function ({ row }) {
          return (
            <div className='flex items-center gap-2'>
              <div className='capitalize font-semibold'>
                {row.getValue('name')}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: function ({ row }) {
          return (
            <div className='flex items-center gap-2'>
              <div className='capitalize font-semibold'>
                {format(
                  row.getValue('created_at'),
                  "MMMM dd, yyyy hh:mm aaaaa'm'"
                )}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        cell: function ({ row }) {
          return (
            <div className='flex items-center gap-2'>
              <div className='capitalize font-semibold'>
                {row.getValue('updated_at')
                  ? format(
                      row.getValue('updated_at'),
                      "MMMM dd, yyyy hh:mm aaaaa'm'"
                    )
                  : 'N/A'}
              </div>
            </div>
          )
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() =>
                  toggleOpen?.(true, 'edit', {
                    name: row.original.name,
                    id: row.original.id
                  })
                }
              >
                <Pencil />
                Edit info
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toggleOpen?.(true, 'delete', {
                    name: row.original.name,
                    id: row.original.id
                  })
                }
              >
                <Trash />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ],
    [toggleOpen]
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  })

  return (
    <div className='w-full'>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Search categories...'
          onChange={(event) => onSearch(event)}
          className='max-w-sm'
        />

        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='ml-auto'>
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map(function (column) {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => toggleOpen?.(true, 'add', null)}>
            <Plus className='w-5 h-5' />
            Add Leave Categories
          </Button>
        </div>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(function (header) {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination {...{ totalPages, currentPage, count }} />
    </div>
  )
}
