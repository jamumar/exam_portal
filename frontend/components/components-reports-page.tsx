'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, LogOut, User } from 'lucide-react'
import axios from 'axios'

interface ExamScore {
  id: number
  name: string
  score: number
  date: string
}

interface SectionProgress {
  section: string
  scores: number[]
}

interface ReportData {
  examScores: ExamScore[]
  sectionProgress: SectionProgress[]
  strengths: string[]
  weaknesses: string[]
  recommendedStudyAreas: string[]
}

interface UserData {
  id: number
  username: string
  email: string
  test_type: string
  avatar_url?: string
}

export function ReportsPageComponent() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
        if (!token) {
          throw new Error('No access token found')
        }

        axios.defaults.baseURL = 'http://127.0.0.1:8000/api'
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        const [userResponse, reportResponse] = await Promise.all([
          axios.get('/users/user/'),
          axios.get('/student/reports/')
        ])

        setUserData(userResponse.data)
        setReportData(reportResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to fetch data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout/')
      localStorage.removeItem('access_token')
      sessionStorage.removeItem('access_token')
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
      setError('Failed to log out. Please try again.')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!userData || !reportData) {
    return <div>No data available</div>
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Reports</h1>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative">
                <Avatar>
                  <AvatarImage src={userData.avatar_url} alt={userData.username} />
                  <AvatarFallback>{userData.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <nav className="mb-6">
        <ul className="flex space-x-4">
          <li>
            <Link href="/dashboard" className="text-blue-500 hover:text-blue-700">Dashboard</Link>
          </li>
          <li>
            <Link href="/reports" className="text-blue-500 hover:text-blue-700">Reports</Link>
          </li>
        </ul>
      </nav>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Exam Score Progress</CardTitle>
            <CardDescription>Your {userData.test_type} exam scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              score: {
                label: "Score",
                color: "hsl(var(--chart-1))",
              },
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.examScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="var(--color-score)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Section Progress</CardTitle>
            <CardDescription>Your progress in different sections</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              score: {
                label: "Score",
                color: "hsl(var(--chart-1))",
              },
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.sectionProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="section" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {reportData.sectionProgress[0].scores.map((_, index) => (
                    <Line 
                      key={index} 
                      type="monotone" 
                      dataKey={`scores[${index}]`} 
                      stroke={`hsl(${index * 30}, 70%, 50%)`} 
                      name={`Attempt ${index + 1}`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Strengths and Weaknesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Strengths:</h3>
              <ul className="list-disc pl-5">
                {reportData.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Weaknesses:</h3>
              <ul className="list-disc pl-5">
                {reportData.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recommended Study Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {reportData.recommendedStudyAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Exam Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.examScores.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.name}</TableCell>
                  <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                  <TableCell>{exam.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}