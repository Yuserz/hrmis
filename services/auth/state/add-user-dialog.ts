import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'

export interface AddUserDialog {
  open: boolean
  toggleOpenDialog?: (isOpen: boolean) => void
}

const initialState: AddUserDialog = {
  open: false
}

export const useCreateCategoryDialog = create<AddUserDialog>()(
  persist(
    (set) => ({
      ...initialState,
      toggleOpenDialog: (isOpen: boolean) => {
        set((state) => ({
          ...state,
          open: isOpen
        }))
      }
    }),
    {
      name: 'add-user-dialog',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
