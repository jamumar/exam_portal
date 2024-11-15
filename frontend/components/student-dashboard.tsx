'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Loader2, BookOpen, Calendar, TrendingUp } from 'lucide-react'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

interface Exam {
  id: number
  name: string
  exam_type: string
  created_at: string
  updated_at: string
}

interface ExamSubmission {
  id: number
  exam: number
  total_score: number
  submitted_at: string
}

interface DashboardData {
  user: {
    id: number
    username: string
    email: string
    test_type: string
  }
  recent_submissions?: ExamSubmission[]
  performance_data?: { section: string; score: number }[]
}

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [availableExams, setAvailableExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      const dashboardResponse = await axios.get(`${API_BASE_URL}/student/dashboard/`)
      
      if (!dashboardResponse.data || typeof dashboardResponse.data !== 'object') {
        throw new Error('Invalid dashboard data received')
      }

      setDashboardData(dashboardResponse.data)

      const testType = dashboardResponse.data.user.test_type.toLowerCase()
      const examsResponse = await axios.get(`${API_BASE_URL}/${testType}-exams/`)
      
      if (Array.isArray(examsResponse.data)) {
        setAvailableExams(examsResponse.data)
      } else {
        console.error('Invalid exams data received:', examsResponse.data)
        setAvailableExams([])
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await refreshToken()
      } else {
        setError('Failed to fetch dashboard data. Please try again later.')
        setIsLoading(false)
      }
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token found')
      }

      const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
        refresh: refreshToken
      })

      const { access } = response.data
      if (localStorage.getItem('access_token')) {
        localStorage.setItem('access_token', access)
      } else {
        sessionStorage.setItem('access_token', access)
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`

      await fetchDashboardData()
    } catch (error) {
      console.error('Error refreshing token:', error)
      router.push('/login')
    }
  }

  const startExam = (examId: number) => {
    const testType = dashboardData?.user.test_type.toLowerCase()
    router.push(`/exam-component?examType=${testType}&examId=${examId}`)
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
            <h2 className="text-2xl font-bold text-center">Loading Dashboard...</h2>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-center text-red-600 mb-4">Error</h2>
            <p className="text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-center mb-4">No Data Available</h2>
            <p className="text-center">Please try logging in again or contact support.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0 text-gray-800 dark:text-gray-100">Student Dashboard</h1>
          <Card className="w-full sm:w-auto bg-primary text-primary-foreground">
            <CardContent className="py-2 px-4">
              <p className="text-sm font-medium">{dashboardData.user.test_type.toUpperCase()} | {dashboardData.user.username}</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-1 overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-lg">
            <CardHeader className="bg-blue-500 text-white">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6" />
                <CardTitle>Available Exams</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {availableExams.length > 0 ? (
                <ul className="space-y-4">
                  {availableExams.map((exam) => (
                    <li key={exam.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
                      <p className="font-medium text-lg mb-1">{exam.name}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Created: {new Date(exam.created_at).toLocaleDateString()}
                        </p>
                        <Button onClick={() => startExam(exam.id)} size="sm">Start Exam</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No exams available at the moment.</p>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-1 overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-lg">
            <CardHeader className="bg-purple-500 text-white">
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6" />
                <CardTitle>Recent Submissions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {dashboardData.recent_submissions && dashboardData.recent_submissions.length > 0 ? (
                <ul className="space-y-4">
                  {dashboardData.recent_submissions.map((submission) => (
                    <li key={submission.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
                      <p className="font-medium text-lg mb-1">Exam #{submission.exam}</p>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                          Score: {submission.total_score}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No recent submissions.</p>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-1 md:col-span-2 lg:col-span-3 overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-lg">
            <CardHeader className="bg-orange-500 text-white">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6" />
                <CardTitle>Performance Chart</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {dashboardData.performance_data && dashboardData.performance_data.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.performance_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="section" />
                      <YAxis />
                      <Bar dataKey="score" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500">No performance data available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}