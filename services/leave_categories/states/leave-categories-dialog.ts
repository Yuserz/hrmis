import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'
import { LeaveCategories } from '@/lib/types/leave_categories'

type LeaveCategoriesDialogType = 'add' | 'edit' | 'delete' | null

export type LeaveCategoriesData = Pick<LeaveCategories, 'name' | 'id'>

export interface LeaveCategoriesDialog {
  open: boolean
  type: LeaveCategoriesDialogType
  data: Partial<LeaveCategoriesData> | null
  toggleOpenDialog?: (
    isOpen: boolean,
    type: LeaveCategoriesDialogType,
    data: LeaveCategoriesData | null
  ) => void
}

const initialState: LeaveCategoriesDialog = {
  data: {
    name: '',
    id: ''
  },
  open: false,
  type: null
}

export const useLeaveCategoriesDialog = create<LeaveCategoriesDialog>()(
  persist(
    (set) => ({
      ...initialState,
      toggleOpenDialog: (
        isOpen: boolean,
        type: LeaveCategoriesDialogType,
        data: LeaveCategoriesData | null
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
      name: 'leave-categories-dialog',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
