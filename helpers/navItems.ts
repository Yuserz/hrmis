import { SideMenu } from '@/lib/types/menus'
import { LayoutDashboard, Users } from 'lucide-react'

export const adminMenus = (id: string): SideMenu[] => {
  return [
    {
      title: 'Dashboard',
      url: `/backend/${id}/dashboard`,
      icon: LayoutDashboard,
      isActive: true
    },
    {
      title: 'Users',
      url: `/backend/${id}/users`,
      icon: Users,
      isActive: true
    }
  ]
}

export const employeeMenus = (id: string): SideMenu[] => {
  return [
    {
      title: 'Dashboard',
      url: `/backend/${id}/dashboard`,
      icon: LayoutDashboard,
      isActive: true
    }
  ]
}

export const staffMenus = (id: string): SideMenu[] => {
  return [
    {
      title: 'Dashboard',
      url: `/backend/${id}/dashboard`,
      icon: LayoutDashboard,
      isActive: true
    }
  ]
}
