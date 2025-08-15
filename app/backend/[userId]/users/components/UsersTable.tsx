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
  File,
  Trash
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
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Users } from '@/lib/types/users'
import { useAuth } from '@/services/auth/state/auth-state'
import { useUserDialog } from '@/services/auth/state/user-dialog'
import { useShallow } from 'zustand/shallow'
import { avatarName } from '@/helpers/avatarName'
import { Pagination } from '@/components/custom/Pagination'
import { Pagination as PaginationType } from '@/lib/types/pagination'
import { useRouter, usePathname } from 'next/navigation'
import { debounce } from 'lodash'

interface UserTableData extends PaginationType {
  users: Users[]
}

export function UsersTable({
  users: data,
  totalPages,
  currentPage,
  count
}: UserTableData) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const { toggleOpen } = useUserDialog(
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

  const state = useAuth()

  const columns: ColumnDef<Users>[] = React.useMemo(
    () => [
      {
        accessorKey: 'username',
        header: 'Username',
        cell: function ({ row }) {
          return (
            <div className='flex items-center gap-2'>
              <Avatar>
                <AvatarImage
                  className='object-cover'
                  src={row.original?.avatar ?? ''}
                  alt={row.original?.email}
                />
                <AvatarFallback className='rounded-lg fill-blue-500 bg-blue-400 text-white font-semibold capitalize'>
                  {avatarName(row.original?.email)}
                </AvatarFallback>
              </Avatar>
              <div className='capitalize font-semibold'>
                {row.getValue('username')}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: 'employee_id',
        header: 'Employee ID',
        cell: ({ row }) => <div>{row.getValue('employee_id') ?? 'N/A'}</div>
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <div className='lowercase'>{row.getValue('email')}</div>
        )
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge className='lowercase' variant='outline'>
            {row.getValue('role')}
          </Badge>
        )
      },
      {
        accessorKey: 'archived_at',
        header: 'Status',
        cell: ({ row }) => (
          <Badge className='lowercase' variant='outline'>
            {row.getValue('archived_at') ? 'Revoked' : 'active'}
          </Badge>
        )
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => (
          <div className='capitalize'>
            {format(row.getValue('created_at'), "MMMM dd, yyyy hh:mm aaaaa'm'")}
          </div>
        )
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        cell: ({ row }) => (
          <div className='capitalize'>
            {row.getValue('updated_at')
              ? format(
                  row.getValue('updated_at'),
                  "MMMM dd, yyyy hh:mm aaaaa'm'"
                )
              : 'N/A'}
          </div>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {['employee'].includes(row.original.role) && (
                <DropdownMenuItem>
                  <File />
                  View PDS
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => toggleOpen?.(true, 'edit', { ...row.original })}
              >
                <Pencil />
                Edit info
              </DropdownMenuItem>
              {state.id !== row.original.id && (
                <DropdownMenuItem
                  onClick={() =>
                    toggleOpen?.(
                      true,
                      row.original.archived_at ? 'reinstate' : 'revoked',
                      { ...row.original }
                    )
                  }
                >
                  <Trash />
                  {row.original.archived_at ? 'Reinstate' : 'Revoke'}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ],
    [toggleOpen, state]
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
          placeholder='Search users...'
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
            Add User <Plus className='w-5 h-5' />
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
