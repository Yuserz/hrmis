import { SideMenu } from '@/lib/types/menus'
import {
  LayoutDashboard,
  Users,
  TowerControl,
  Plane,
  FileText
} from 'lucide-react'

export const adminMenus = (id: string): SideMenu[] => {
  return [
    {
      title: 'Dashboard',
      url: `/backend/${id}/dashboard`,
      icon: LayoutDashboard,
      isActive: true
    },
    {
      title: 'Attendance',
      url: `/backend/${id}/attendance`,
      icon: FileText,
      isActive: true
    },
    {
      title: 'Leaves',
      url: `/backend/${id}/leaves?page=1`,
      icon: Plane,
      isActive: true
    },
    {
      title: 'Leave Categories',
      url: `/backend/${id}/leave-categories?page=1`,
      icon: TowerControl,
      isActive: true
    },
    {
      title: 'Users',
      url: `/backend/${id}/users?page=1`,
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
      title: 'Users',
      url: `/backend/${id}/users?page=1`,
      icon: Users,
      isActive: true
    }
  ]
}
