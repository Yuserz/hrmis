import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'

type UserDialogType = 'add' | 'edit' | null

export interface AddUserDialog {
  open: boolean
  type: 'add' | 'edit' | null
  toggleOpenDialog?: (isOpen: boolean, type: UserDialogType) => void
}

const initialState: AddUserDialog = {
  open: false,
  type: null
}

export const useCreateUserDialog = create<AddUserDialog>()(
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
