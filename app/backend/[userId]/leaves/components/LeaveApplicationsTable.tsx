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
import {
  ChevronDown,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash,
  CheckCircle
} from 'lucide-react'
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
import { TooltipComponent } from '@/components/custom/Tooltip'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useShallow } from 'zustand/shallow'
import { Pagination } from '@/components/custom/Pagination'
import { Pagination as PaginationType } from '@/lib/types/pagination'
import { useRouter, usePathname } from 'next/navigation'
import { debounce } from 'lodash'
import { LeaveApplicationsForm } from '@/lib/types/leave_application'
import { useLeaveApplicationDialog } from '@/services/leave_applications/states/leave-application-dialog'

interface LeaveTableData extends PaginationType {
  leave_applications: LeaveApplicationsForm[]
}

export function LeaveApplicationsTable({
  leave_applications: data,
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

  const { toggleOpen } = useLeaveApplicationDialog(
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

  const columns: ColumnDef<LeaveApplicationsForm>[] = React.useMemo(
    () => [
      {
        accessorKey: 'users',
        header: 'Email',
        cell: function ({ row }) {
          return (
            <div className='font-semibold'>{row.original.users?.email}</div>
          )
        }
      },
      {
        accessorKey: 'leave_categories',
        header: 'Application name',
        cell: function ({ row }) {
          return (
            <div className='capitalize'>
              {row.original.leave_categories?.name}
            </div>
          )
        }
      },
      {
        accessorKey: 'start_date',
        header: 'Started Date',
        cell: function ({ row }) {
          return (
            <div className='capitalize'>
              {format(row.original.start_date, "MMMM dd, yyyy hh:mm aaaaa'm'")}
            </div>
          )
        }
      },
      {
        accessorKey: 'end_date',
        header: 'End Date',
        cell: function ({ row }) {
          return (
            <div className='capitalize'>
              {format(row.original.end_date, "MMMM dd, yyyy hh:mm aaaaa'm'")}
            </div>
          )
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: function ({ row }) {
          return (
            <Badge variant='outline' className='capitalize'>
              {row.original.status}
            </Badge>
          )
        }
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: function ({ row }) {
          return (
            <TooltipComponent value={row.original.remarks as string}>
              <div className='capitalize line-clamp-1 text-ellipsis w-30'>
                {row.original.remarks}
              </div>
            </TooltipComponent>
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
                onClick={() => toggleOpen?.(true, 'edit', { ...row.original })}
              >
                <Pencil />
                Edit File
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toggleOpen?.(true, 'approve', { ...row.original })
                }
              >
                <CheckCircle />
                {row.original.status === 'approved'
                  ? 'Disapproved'
                  : 'Approved'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toggleOpen?.(true, 'delete', { ...row.original })
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
          placeholder='Search leave name...'
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
            File a leave
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
