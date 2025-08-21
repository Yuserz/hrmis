import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'
import { LeaveApplicationsForm } from '@/lib/types/leave_application'

type LeaveApplicationDialogType =
  | 'add'
  | 'edit'
  | 'approve'
  | 'disapprove'
  | 'delete'
  | null

export type LeaveApplicationsData = Omit<
  LeaveApplicationsForm,
  'created_at' | 'updated_at' | 'archived_at'
>

export interface LeaveApplicationsDialog {
  open: boolean
  type: LeaveApplicationDialogType
  data: Partial<LeaveApplicationsData> | null
  toggleOpenDialog?: (
    isOpen: boolean,
    type: LeaveApplicationDialogType,
    data: LeaveApplicationsData | null
  ) => void
}

const initialState: LeaveApplicationsDialog = {
  data: {
    users: {
      email: '',
      username: '',
      id: ''
    },
    leave_categories: {
      name: '',
      id: ''
    },
    start_date: '',
    end_date: '',
    status: '',
    remarks: ''
  },
  open: false,
  type: null
}

export const useLeaveApplicationDialog = create<LeaveApplicationsDialog>()(
  persist(
    (set) => ({
      ...initialState,
      toggleOpenDialog: (
        isOpen: boolean,
        type: LeaveApplicationDialogType,
        data: LeaveApplicationsData | null
      ) => {
        set((state) => ({
          ...state,
          open: isOpen,
          type,
          data
        }))
      }
    }),
    {
      name: 'leave-application-dialog',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
