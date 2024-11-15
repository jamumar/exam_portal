'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8000/api'

interface Question {
  id?: number
  passage: string
  text: string
  question_type: 'multiple-choice' | 'fill-in-the-blank' | 'writing' | 'speaking'
  sub_type: 'simple' | 'math' | 'graph'
  options: { A: string; B: string; C: string; D: string }
  correct_answer: string
  explanation: string
  unit?: string
  graph_description?: string
  image?: File
  set?: number
}

interface Module {
  id?: number
  name: string
  difficulty: 'standard' | 'hard' | 'easy'
  questions: Question[]
  duration: number
  question_count: number
  set_count?: number
  instructions?: string
}

interface Section {
  id?: number
  name: string
  modules: Module[]
  instructions?: string
}

interface Exam {
  id?: number
  name: string
  sections: Section[]
  exam_type: string
  ielts_type?: 'academic' | 'general'
  instructions?: string
}

interface ExamCreatorProps {
  examType: 'SAT' | 'GRE' | 'GMAT' | 'IELTS'
  icon: React.ReactNode
}

export default function ExamCreator({ examType, icon }: ExamCreatorProps) {
  const router = useRouter()
  const [exam, setExam] = useState<Exam>({
    name: '',
    sections: [],
    exam_type: examType.toLowerCase(),
    instructions: ''
  })
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [currentDifficulty, setCurrentDifficulty] = useState<'standard' | 'hard' | 'easy'>('standard')
  const [question, setQuestion] = useState<Question>({
    passage: '',
    text: '',
    question_type: 'multiple-choice',
    sub_type: 'simple',
    options: { A: '', B: '', C: '', D: '' },
    correct_answer: '',
    explanation: '',
    set: 1
  })
  const [moduleCompleted, setModuleCompleted] = useState<string | null>(null)
  const [sectionCompleted, setSectionCompleted] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('Current exam state:', exam)
  }, [exam])

  const handleExamNameChange = (name: string) => {
    setExam(prev => ({ ...prev, name }))
  }

  const handleExamInstructionsChange = (instructions: string) => {
    setExam(prev => ({ ...prev, instructions }))
  }

  const handleAddExam = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const examData = {
        name: exam.name,
        exam_type: examType.toLowerCase(),
        ielts_type: examType === 'IELTS' ? exam.ielts_type : undefined,
        instructions: exam.instructions
      }
      const response = await axios.post(`/${examType.toLowerCase()}-exams/`, examData)
      const newExam = response.data
      setExam(prev => ({ ...prev, id: newExam.id }))
      await handleCreateStructure(newExam.id)
    } catch (error) {
      console.error('Error creating exam:', error)
      setError('Failed to create exam. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateStructure = async (examId: number) => {
    try {
      await axios.post(`/${examType.toLowerCase()}-exams/${examId}/create-structure/`)
      const response = await axios.get(`/${examType.toLowerCase()}-exams/${examId}/`)
      const structuredExam = response.data
      setExam(structuredExam)
    } catch (error) {
      console.error('Error creating exam structure:', error)
      setError('Failed to create exam structure. Please try again.')
    }
  }

  const handleUpdateModule = (sectionIndex: number, moduleIndex: number, field: keyof Module, value: any) => {
    setExam(prev => ({
      ...prev,
      sections: prev.sections.map((section, sIndex) =>
        sIndex === sectionIndex
          ? {
              ...section,
              modules: section.modules.map((module, mIndex) =>
                mIndex === moduleIndex
                  ? { ...module, [field]: value }
                  : module
              )
            }
          : section
      )
    }))
  }

  const handleAddQuestion = async () => {
    setIsLoading(true)
    setError(null)
    const currentSection = exam.sections[currentSectionIndex]
    const currentModule = currentSection.modules[currentModuleIndex]
    
    try {
      const questionData = {
        ...question,
        module: currentModule.id,
        correct_answer: question.correct_answer.toUpperCase()
      }

      const response = await axios.post(`/${examType.toLowerCase()}-questions/`, questionData)
      
      const newQuestion = response.data

      setExam(prev => ({
        ...prev,
        sections: prev.sections.map((section, sIndex) =>
          sIndex === currentSectionIndex
            ? {
                ...section,
                modules: section.modules.map((module, mIndex) =>
                  mIndex === currentModuleIndex
                    ? { 
                        ...module, 
                        questions: [...module.questions, newQuestion]
                      }
                    : module
                )
              }
            : section
        )
      }))

      setQuestion({
        passage: '',
        text: '',
        question_type: 'multiple-choice',
        sub_type: 'simple',
        options: { A: '', B: '', C: '', D: '' },
        correct_answer: '',
        explanation: '',
        set: currentSetIndex + 1
      })
      moveToNextQuestion()
    } catch (error) {
      console.error('Error adding question:', error)
      if (axios.isAxiosError(error) && error.response) {
        setError(JSON.stringify(error.response.data))
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const moveToNextQuestion = () => {
    const currentSection = exam.sections[currentSectionIndex]
    const currentModule = currentSection.modules[currentModuleIndex]
    const questionsInCurrentSet = currentModule.questions.filter(q => q.set === currentSetIndex + 1).length

    if (questionsInCurrentSet + 1 < currentModule.question_count) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      moveToNextModule()
    }
  }

  const moveToNextModule = () => {
    const currentSection = exam.sections[currentSectionIndex]
    
    setModuleCompleted(currentSection.modules[currentModuleIndex].name)

    if (currentModuleIndex + 1 < currentSection.modules.length) {
      setCurrentModuleIndex(prev => prev + 1)
      setCurrentQuestionIndex(0)
      setCurrentSetIndex(0)
    } else {
      moveToNextSection()
    }
  }

  const moveToNextSection = () => {
    setSectionCompleted(exam.sections[currentSectionIndex].name)
    if (currentSectionIndex + 1 < exam.sections.length) {
      setCurrentSectionIndex(prev => prev + 1)
      setCurrentModuleIndex(0)
      setCurrentQuestionIndex(0)
      setCurrentSetIndex(0)
    } else {
      // Exam creation completed
      router.push(`/exams/${examType.toLowerCase()}`)
    }
  }

  const handleSubmitExam = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await axios.put(`/${examType.toLowerCase()}-exams/${exam.id}/`, exam)
      router.push(`/exams/${examType.toLowerCase()}`)
    } catch (error) {
      console.error('Error submitting exam:', error)
      setError('Failed to submit exam. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentModule = () => {
    return exam.sections[currentSectionIndex]?.modules[currentModuleIndex]
  }

  const getModuleProgress = () => {
    const currentModule = getCurrentModule()
    if (!currentModule) return 0
    return (currentModule.questions.length / currentModule.question_count) * 100
  }

  const currentModule = getCurrentModule()

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Back to Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            Create {examType} Exam
          </h1>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!exam.id ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="examName">Exam Name</Label>
                  <Input
                    id="examName"
                    value={exam.name}
                    onChange={(e) => handleExamNameChange(e.target.value)}
                    placeholder="Enter exam name"
                  />
                </div>
                <div>
                  <Label htmlFor="examInstructions">Exam Instructions</Label>
                  <Textarea
                    id="examInstructions"
                    value={exam.instructions}
                    onChange={(e) => handleExamInstructionsChange(e.target.value)}
                    placeholder="Enter exam instructions"
                  />
                </div>
                {examType === 'IELTS' && (
                  <div>
                    <Label htmlFor="ieltsType">IELTS Type</Label>
                    <Select
                      onValueChange={(value) => setExam(prev => ({ ...prev, ielts_type: value as 'academic' | 'general' }))}
                      value={exam.ielts_type}
                    >
                      <SelectTrigger id="ieltsType">
                        <SelectValue placeholder="Select IELTS type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="general">General Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button onClick={handleAddExam} disabled={!exam.name || (examType === 'IELTS' && !exam.ielts_type) || isLoading}>
                  {isLoading ? 'Creating...' : 'Create Exam'}
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">{exam.name}</h2>
                  <Tabs value={exam.sections[currentSectionIndex]?.name} onValueChange={(value) => {
                    const newIndex = exam.sections.findIndex(s => s.name === value)
                    if (newIndex !== -1) {
                      setCurrentSectionIndex(newIndex)
                      setCurrentModuleIndex(0)
                      setCurrentQuestionIndex(0)
                      setCurrentSetIndex(0)
                    }
                  }}>
                    <TabsList>
                      {exam.sections.map((section) => (
                        <TabsTrigger key={section.name} value={section.name}>
                          {section.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  <p>Section: {exam.sections[currentSectionIndex]?.name}</p>
                  <p>Module: {currentModule?.name}</p>
                  <p>Question {currentQuestionIndex + 1} of {currentModule?.question_count}</p>
                  <Progress value={getModuleProgress()} className="mt-2" />
                </div>
                {moduleCompleted && (
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Module Completed</AlertTitle>
                    <AlertDescription>
                      You have completed all questions for the {moduleCompleted} module.
                    </AlertDescription>
                  </Alert>
                )}
                {sectionCompleted && (
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Section Completed</AlertTitle>
                    <AlertDescription>
                      You have completed all questions for the {sectionCompleted} section.
                    </AlertDescription>
                  </Alert>
                )}
                {currentModule && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="moduleName">Module Name</Label>
                      <Input
                        id="moduleName"
                        value={currentModule.name}
                        onChange={(e) => handleUpdateModule(currentSectionIndex, currentModuleIndex, 'name', e.target.value)}
                        placeholder="Enter module name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="moduleInstructions">Module Instructions</Label>
                      <Textarea
                        id="moduleInstructions"
                        value={currentModule.instructions || ''}
                        onChange={(e) => handleUpdateModule(currentSectionIndex, currentModuleIndex, 'instructions', e.target.value)}
                        placeholder="Enter module instructions"
                      />
                    </div>
                    <div>
                      <Label htmlFor="passage">Passage</Label>
                      <Textarea
                        id="passage"
                        value={question.passage}
                        onChange={(e) => setQuestion({ ...question, passage: e.target.value })}
                        placeholder="Enter passage text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="questionText">Question Text</Label>
                      <Textarea
                        id="questionText"
                        value={question.text}
                        onChange={(e) => setQuestion({ ...question, text: e.target.value })}
                        placeholder="Enter question text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="questionType">Question Type</Label>
                      <Select
                        onValueChange={(value) => setQuestion({ ...question, question_type: value as Question['question_type'] })}
                        value={question.question_type}
                      >
                        <SelectTrigger id="questionType">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="fill-in-the-blank">Fill in the Blank</SelectItem>
                          {examType === 'GRE' && (
                            <>
                              <SelectItem value="writing">Writing</SelectItem>
                              <SelectItem value="quantitative">Quantitative</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subType">Sub Type</Label>
                      <Select
                        onValueChange={(value) => setQuestion({ ...question, sub_type: value as Question['sub_type'] })}
                        value={question.sub_type}
                      >
                        <SelectTrigger id="subType">
                          <SelectValue placeholder="Select sub type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="math">Math</SelectItem>
                          <SelectItem value="graph">Graph</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {question.question_type === 'multiple-choice' && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {['A', 'B', 'C', 'D'].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Input
                              id={`option${option}`}
                              value={question.options[option as keyof typeof question.options]}
                              onChange={(e) =>
                                setQuestion({
                                  ...question,
                                  options: { ...question.options, [option]: e.target.value },
                                })
                              }
                              placeholder={`Option ${option}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {question.question_type === 'multiple-choice' && (
                      <div>
                        <Label htmlFor="correctAnswer">Correct Answer</Label>
                        <Select
                          value={question.correct_answer}
                          onValueChange={(value) => setQuestion({ ...question, correct_answer: value })}
                        >
                          <SelectTrigger id="correctAnswer">
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {['A', 'B', 'C', 'D'].map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {question.sub_type === 'math' && (
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          value={question.unit || ''}
                          onChange={(e) => setQuestion({ ...question, unit: e.target.value })}
                          placeholder="Enter unit (if applicable)"
                        />
                      </div>
                    )}
                    {question.sub_type === 'graph' && (
                      <div>
                        <Label htmlFor="graphDescription">Graph Description</Label>
                        <Textarea
                          id="graphDescription"
                          value={question.graph_description || ''}
                          onChange={(e) => setQuestion({ ...question, graph_description: e.target.value })}
                          placeholder="Describe the graph for this question"
                        />
                        <Label htmlFor="graphImage" className="mt-2">Graph Image</Label>
                        <Input
                          id="graphImage"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setQuestion({ ...question, image: file })
                            }
                          }}
                          accept="image/*"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="explanation">Explanation</Label>
                      <Textarea
                        id="explanation"
                        value={question.explanation}
                        onChange={(e) => setQuestion({ ...question, explanation: e.target.value })}
                        placeholder="Enter explanation for the correct answer"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-between mt-6">
                  <Button onClick={handleAddQuestion} disabled={!question.text || !question.correct_answer || isLoading}>
                    {isLoading ? 'Adding...' : (currentQuestionIndex + 1 < (currentModule?.question_count || 0) ? 'Next Question' : 'Finish Module')}
                  </Button>
                  {currentSectionIndex === exam.sections.length - 1 &&
                   currentModuleIndex === exam.sections[currentSectionIndex].modules.length - 1 &&
                   currentQuestionIndex + 1 === (currentModule?.question_count || 0) && (
                    <Button onClick={handleSubmitExam} disabled={isLoading}>
                      {isLoading ? 'Submitting...' : 'Submit Exam'}
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}