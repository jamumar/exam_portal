import { Metadata } from 'next'
import AdminDashboard from '@/components/admin-dashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Exam Management System Admin Dashboard',
}

export default function AdminPage() {
  return <AdminDashboard />
}