import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'
import { Users } from '@/lib/types/users'

type UserDialogType = 'add' | 'edit' | null
type UserData = Pick<
  Users,
  'username' | 'role' | 'employee_id' | 'avatar' | 'email' | 'id'
>

export interface UserDialog {
  open: boolean
  type: 'add' | 'edit' | null
  data: UserData | null
  toggleOpenDialog?: (
    isOpen: boolean,
    type: UserDialogType,
    data: UserData | null
  ) => void
}

const initialState: UserDialog = {
  data: {
    id: '',
    email: '',
    username: '',
    role: '',
    employee_id: '',
    avatar: ''
  },
  open: false,
  type: null
}

export const useUserDialog = create<UserDialog>()(
  persist(
    (set) => ({
      ...initialState,
      toggleOpenDialog: (
        isOpen: boolean,
        type: UserDialogType,
        data: UserData | null
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
      name: 'add-user-dialog',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
