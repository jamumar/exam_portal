'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Plus, Search, Loader2, Trash2, Save, X } from 'lucide-react'
import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8000/api'

interface Question {
  id: number
  text: string
  type: 'multiple-choice' | 'essay' | 'math' | 'graph'
  options?: { A: string; B: string; C: string; D: string }
  correctAnswer?: 'A' | 'B' | 'C' | 'D'
  explanation: string
  unit?: string
  graphInfo?: string
}

interface Module {
  id: number
  name: string
  difficulty: string
  questions: Question[]
}

interface Section {
  id: number
  name: string
  modules: Module[]
}

interface Exam {
  id: number
  name: string
  sections: Section[]
  created_at: string
  updated_at: string
}

interface ExamTypeDetailsProps {
  examType: string
  icon: React.ReactNode
}

export default function ExamTypeDetails({ examType, icon }: ExamTypeDetailsProps) {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const examsPerPage = 10

  useEffect(() => {
    fetchExams()
  }, [examType])

  const fetchExams = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`/${examType.toLowerCase()}-exams/`)
      if (response.status === 200) {
        setExams(response.data)
      } else {
        setError('Failed to fetch exams')
      }
    } catch (error) {
      setError('Error fetching exams')
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExamDetails = async (examId: number) => {
    try {
      const response = await axios.get(`/${examType.toLowerCase()}-exams/${examId}/`)
      if (response.status === 200) {
        setEditingExam(response.data)
        setIsEditDialogOpen(true)
      } else {
        setError('Failed to fetch exam details')
      }
    } catch (error) {
      setError('Error fetching exam details')
      console.error('Error fetching exam details:', error)
    }
  }

  const handleDeleteExam = async () => {
    if (!examToDelete) return

    try {
      const response = await axios.delete(`/${examType.toLowerCase()}-exams/${examToDelete.id}/`)

      if (response.status === 204) {
        setExams(exams.filter(exam => exam.id !== examToDelete.id))
        setIsDeleteDialogOpen(false)
        setExamToDelete(null)
      } else {
        setError('Failed to delete exam')
      }
    } catch (error) {
      setError('Error deleting exam')
      console.error('Error deleting exam:', error)
    }
  }

  const handleEditExam = (exam: Exam) => {
    fetchExamDetails(exam.id)
  }

  const handleSaveExam = async () => {
    if (!editingExam) return

    try {
      const response = await axios.put(`/${examType.toLowerCase()}-exams/${editingExam.id}/`, editingExam)

      if (response.status === 200) {
        const updatedExam = response.data
        setExams(exams.map(exam => exam.id === updatedExam.id ? updatedExam : exam))
        setIsEditDialogOpen(false)
        setEditingExam(null)
      } else {
        setError('Failed to update exam')
      }
    } catch (error) {
      setError('Error updating exam')
      console.error('Error updating exam:', error)
    }
  }

  const filteredExams = exams.filter(exam => 
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const indexOfLastExam = currentPage * examsPerPage
  const indexOfFirstExam = indexOfLastExam - examsPerPage
  const currentExams = filteredExams.slice(indexOfFirstExam, indexOfLastExam)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleCreateNewExam = () => {
    router.push(`/admin/exams/${examType.toLowerCase()}/create`)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <Link href="/admin">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            {icon}
            <span className="ml-2">{examType} Exams</span>
          </h1>
          <Button onClick={handleCreateNewExam}>
            <Plus className="mr-2 h-4 w-4" /> Create New Exam
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Exam Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Exams: {exams.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 max-w-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam Name</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentExams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell>{exam.name}</TableCell>
                          <TableCell>{new Date(exam.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(exam.updated_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" onClick={() => handleEditExam(exam)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Button>
                              <Button variant="ghost" onClick={() => {
                                setExamToDelete(exam)
                                setIsDeleteDialogOpen(true)
                              }}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex justify-center">
                  {Array.from({ length: Math.ceil(filteredExams.length / examsPerPage) }, (_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      className="mx-1"
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete the exam "{examToDelete?.name}"?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteExam}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingExam && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Exam: {editingExam.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label htmlFor="examName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exam Name
                </label>
                <Input
                  id="examName"
                  value={editingExam.name}
                  onChange={(e) => setEditingExam({ ...editingExam, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              {editingExam.sections && editingExam.sections.length > 0 ? (
                editingExam.sections.map((section, sectionIndex) => (
                  <div key={section.id} className="space-y-2">
                    <h3 className="text-lg font-medium">Section {sectionIndex + 1}: {section.name}</h3>
                    <Input
                      value={section.name}
                      onChange={(e) => {
                        const updatedSections = [...editingExam.sections];
                        updatedSections[sectionIndex].name = e.target.value;
                        setEditingExam({ ...editingExam, sections: updatedSections });
                      }}
                      className="mt-1"
                    />
                    {section.modules && section.modules.length > 0 ? (
                      section.modules.map((module, moduleIndex) => (
                        <div key={module.id} className="pl-4 space-y-2">
                          <h4 className="text-md font-medium">Module {moduleIndex + 1}: {module.name}</h4>
                          <Input
                            value={module.name}
                            onChange={(e) => {
                              const updatedSections = [...editingExam.sections];
                              updatedSections[sectionIndex].modules[moduleIndex].name = e.target.value;
                              setEditingExam({ ...editingExam, sections: updatedSections });
                            }}
                            className="mt-1"
                          />
                          <Select
                            value={module.difficulty}
                            onValueChange={(value) => {
                              const updatedSections = [...editingExam.sections];
                              updatedSections[sectionIndex].modules[moduleIndex].difficulty = value;
                              setEditingExam({ ...editingExam, sections: updatedSections });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                          {module.questions && module.questions.length > 0 ? (
                            module.questions.map((question, questionIndex) => (
                              <div key={question.id} className="pl-4 space-y-2">
                                <h5 className="font-medium">Question {questionIndex + 1}</h5>
                                <Textarea
                                  value={question.text}
                                  onChange={(e) => {
                                    const updatedSections = [...editingExam.sections];
                                    updatedSections[sectionIndex].modules[moduleIndex].questions[questionIndex].text = e.target.value;
                                    setEditingExam({ ...editingExam, sections: updatedSections });
                                  }}
                                  className="mt-1"
                                />
                                <Select
                                  value={question.type}
                                  onValueChange={(value: 'multiple-choice' | 'essay' | 'math' | 'graph') => {
                                    const updatedSections = [...editingExam.sections];
                                    updatedSections[sectionIndex].modules[moduleIndex].questions[questionIndex].type = value;
                                    setEditingExam({ ...editingExam, sections: updatedSections });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select question type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                    <SelectItem value="essay">Essay</SelectItem>
                                    <SelectItem value="math">Math</SelectItem>
                                    <SelectItem value="graph">Graph</SelectItem>
                                  </SelectContent>
                                </Select>
                                {question.type === 'multiple-choice' && question.options && (
                                  <div className="space-y-2">
                                    {Object.entries(question.options).map(([key, value]) => (
                                      <div key={key}>
                                        <label htmlFor={`option-${key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                          Option {key}
                                        </label>
                                        <Input
                                          id={`option-${key}`}
                                          value={value}
                                          onChange={(e) => {
                                            const updatedSections = [...editingExam.sections];
                                            updatedSections[sectionIndex].modules[moduleIndex].questions[questionIndex].options = {
                                              ...updatedSections[sectionIndex].modules[moduleIndex].questions[questionIndex].options,
                                              [key]: e.target.value
                                            } as { A: string; B: string; C: string; D: string };
                                            setEditingExam({ ...editingExam, sections: updatedSections });
                                          }}
                                          className="mt-1"
                                        />
                                      </div>
                                    ))}
                                    <Select
                                      value={question.correctAnswer}
                                      onValueChange={(value: 'A' | 'B' | 'C' | 'D') => {
                                        const updatedSections = [...editingExam.sections];
                                        updatedSections[sectionIndex].modules[moduleIndex].questions[questionIndex].correctAnswer = value;
                                        setEditingExam({ ...editingExam, sections: updatedSections });
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select correct answer" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="C">C</SelectItem>
                                        <SelectItem value="D">D</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                                <Textarea
                                  value={question.explanation}
                                  onChange={(e) => {
                                    const updatedSections = [...editingExam.sections];
                                    updatedSections[sectionIndex].modules[moduleIndex].questions[questionIndex].explanation = e.target.value;
                                    setEditingExam({ ...editingExam, sections: updatedSections });
                                  }}
                                  placeholder="Explanation"
                                  className="mt-1"
                                />
                              </div>
                            ))
                          ) : (
                            <p>No questions available for this module.</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No modules available for this section.</p>
                    )}
                  </div>
                ))
              ) : (
                <p>No sections available for this exam.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false)
                setEditingExam(null)
              }}>Cancel</Button>
              <Button onClick={handleSaveExam}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}