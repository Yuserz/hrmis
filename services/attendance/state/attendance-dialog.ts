import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'
import { LeaveCategories } from '@/lib/types/leave_categories'

type AttendanceDialogType = 'upload' | 'bat-file' | 'csv-file' | null

export type AttendanceData = Pick<LeaveCategories, 'name' | 'id'>

export interface AttendanceDialog {
  open: boolean
  type: AttendanceDialogType
  toggleOpenDialog?: (isOpen: boolean, type: AttendanceDialogType) => void
}

const initialState: AttendanceDialog = {
  open: false,
  type: null
}

export const useUploadAttendanceDialog = create<AttendanceDialog>()(
  persist(
    (set) => ({
      ...initialState,
      toggleOpenDialog: (isOpen: boolean, type: AttendanceDialogType) => {
        set((state) => ({
          ...state,
          open: isOpen,
          type
        }))
      }
    }),
    {
      name: 'attendance-dialog',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
