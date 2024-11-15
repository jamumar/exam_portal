'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GraduationCap, BookOpen, PenTool, BarChart, Moon, Sun, Users, Settings, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = 'http://127.0.0.1:8000/api'

interface ExamType {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  exams: number
}

interface RecentActivity {
  id: number
  action: string
  details: string
  timestamp: string
}

interface User {
  id: number
  username: string
  email: string
  test_type: string
  registration_date: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [examTypes, setExamTypes] = useState<ExamType[]>([
    { id: 'SAT', name: 'SAT', icon: <PenTool className="h-12 w-12" />, color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100', exams: 0 },
    { id: 'GRE', name: 'GRE', icon: <GraduationCap className="h-12 w-12" />, color: 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100', exams: 0 },
    { id: 'GMAT', name: 'GMAT', icon: <BookOpen className="h-12 w-12" />, color: 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100', exams: 0 },
    { id: 'IELTS', name: 'IELTS', icon: <BarChart className="h-12 w-12" />, color: 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100', exams: 0 },
  ])
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [totalExams, setTotalExams] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme === 'dark')
    document.body.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode)
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        throw new Error('No access token found')
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }

      const [examStats, activities, userData] = await Promise.all([
        axios.get(`${API_BASE_URL}/exam-stats/`, { headers }),
        axios.get(`${API_BASE_URL}/recent-activities/`, { headers }),
        axios.get(`${API_BASE_URL}/users/user/`, { headers })
      ])

      if (examStats.status === 200) {
        const data = examStats.data
        setExamTypes(prevTypes => 
          prevTypes.map(type => ({
            ...type,
            exams: data.exam_counts[type.id] || 0
          }))
        )
        setTotalQuestions(data.total_questions)
        setTotalExams(Object.values(data.exam_counts).reduce((sum: number, count: unknown) => sum + (count as number), 0))
      }

      if (activities.status === 200) {
        setRecentActivities(activities.data)
      }

      if (userData.status === 200) {
        if (Array.isArray(userData.data)) {
          setUsers(userData.data)
          setTotalUsers(userData.data.length)
        } else if (typeof userData.data === 'object' && userData.data !== null) {
          setUsers([userData.data])
          setTotalUsers(1)
        } else {
          console.error('Unexpected users data format:', userData.data)
          setUsers([])
          setTotalUsers(0)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await refreshToken()
      } else {
        setError('Error fetching data. Please try again.')
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token found')
      }

      const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
        refresh: refreshToken
      })

      localStorage.setItem('adminToken', response.data.access)
      await fetchData()
    } catch (error) {
      console.error('Error refreshing token:', error)
      router.push('/admin/login')
    }
  }

  const handleExamTypeClick = (examTypeId: string) => {
    router.push(`/admin/exams/${examTypeId.toLowerCase()}`)
  }

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      const accessToken = localStorage.getItem('adminToken')
      
      if (!refreshToken || !accessToken) {
        throw new Error('No tokens found')
      }

      await axios.post(`${API_BASE_URL}/users/logout/`, 
        { refresh_token: refreshToken },
        { 
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      )

      localStorage.removeItem('adminToken')
      localStorage.removeItem('refreshToken')
      
      router.push('/admin/login')
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 p-4 ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Exam Management Dashboard</h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <Button variant="outline" onClick={() => router.push('/admin/manage-users')}>
              <Users className="mr-2 h-4 w-4" /> Manage Users
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {examTypes.map(type => (
            <Card 
              key={type.id}
              className={`${type.color} hover:shadow-lg transition-shadow cursor-pointer`}
              onClick={() => handleExamTypeClick(type.id)}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  {type.icon}
                  <div>
                    <h3 className="text-2xl font-semibold">{type.name}</h3>
                    <p>{type.exams} Exams</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-white dark:bg-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalExams}</p>
                <p className="text-gray-600 dark:text-gray-400">Total Exams</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalQuestions}</p>
                <p className="text-gray-600 dark:text-gray-400">Total Questions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalUsers}</p>
                <p className="text-gray-600 dark:text-gray-400">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">-</p>
                <p className="text-gray-600 dark:text-gray-400">Avg. Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="text-gray-600 dark:text-gray-400">
                    {activity.action}: {activity.details} ({new Date(activity.timestamp).toLocaleString()})
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Test Type</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.test_type || 'N/A'}</TableCell>
                        <TableCell>{user.registration_date ? new Date(user.registration_date).toLocaleDateString() : 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No users data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}