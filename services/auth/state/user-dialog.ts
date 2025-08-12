import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'

type UserDialogType = 'add' | 'edit' | null

export interface UserDialog {
  open: boolean
  type: 'add' | 'edit' | null
  toggleOpenDialog?: (isOpen: boolean, type: UserDialogType) => void
}

const initialState: UserDialog = {
  open: false,
  type: null
}

export const useUserDialog = create<UserDialog>()(
  persist(
    (set) => ({
      ...initialState,
      toggleOpenDialog: (isOpen: boolean, type: UserDialogType) => {
        set((state) => ({
          ...state,
          open: isOpen,
          type
        }))
      }
    }),
    {
      name: 'add-user-dialog',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
