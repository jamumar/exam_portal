'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { ChevronLeft, ChevronRight, PenTool, Flag, X, RefreshCcw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

const API_BASE_URL = 'http://127.0.0.1:8000/api'

interface Question {
  id: number
  text: string
  options: string[]
  question_type: string
}

interface ExamData {
  id: number
  name: string
  exam_type: 'SAT' | 'GMAT' | 'GRE' | 'IELTS'
  questions: Question[]
}

export default function ExamComponent() {
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(3600) // 1 hour in seconds
  const [annotation, setAnnotation] = useState('')
  const [answers, setAnswers] = useState<string[]>([])
  const [markedQuestions, setMarkedQuestions] = useState<boolean[]>([])
  const [crossedOptions, setCrossedOptions] = useState<boolean[][]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isAnnotationVisible, setIsAnnotationVisible] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const examDisplayId = searchParams.get('examDisplayId')

  const fetchExamData = async () => {
    if (!examDisplayId) {
      setLoadingError('No exam display ID provided. Please return to the dashboard and select an exam.')
      return
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/exam-displays/${examDisplayId}/questions/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      setExamData({
        id: parseInt(examDisplayId),
        name: `${response.data[0]?.exam_type || 'Unknown'} Exam`,
        exam_type: response.data[0]?.exam_type || 'Unknown',
        questions: response.data
      })
      setAnswers(new Array(response.data.length).fill(''))
      setMarkedQuestions(new Array(response.data.length).fill(false))
      setCrossedOptions(response.data.map((q: Question) => new Array(q.options?.length || 0).fill(false)))
      
      // Start the exam session
      const sessionResponse = await axios.post(`${API_BASE_URL}/exam-displays/${examDisplayId}/start_session/`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      setSessionId(sessionResponse.data.id)
      setLoadingError(null)
    } catch (error) {
      console.error('Error fetching exam data:', error)
      setLoadingError('Failed to load exam data. Please try again.')
    }
  }

  useEffect(() => {
    fetchExamData()
  }, [examDisplayId])

  useEffect(() => {
    const timer = timeLeft > 0 &&
      setInterval(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearInterval(timer as NodeJS.Timeout)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleNextQuestion = () => {
    if (answers[currentQuestion] || markedQuestions[currentQuestion]) {
      if (currentQuestion + 1 < (examData?.questions.length || 0)) {
        setCurrentQuestion(currentQuestion + 1)
        setShowError(false)
        setIsAnnotationVisible(false)
      }
    } else {
      setShowError(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setShowError(false)
      setIsAnnotationVisible(false)
    }
  }

  const handleAnswerChange = async (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
    setShowError(false)

    try {
      await axios.post(`${API_BASE_URL}/exam-displays/${examDisplayId}/submit_answer/`, {
        question_id: examData?.questions[currentQuestion].id,
        answer: value,
        exam_session: sessionId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const handleMarkQuestion = () => {
    const newMarkedQuestions = [...markedQuestions]
    newMarkedQuestions[currentQuestion] = !newMarkedQuestions[currentQuestion]
    setMarkedQuestions(newMarkedQuestions)
  }

  const handleSubmit = () => {
    if (answers[currentQuestion] || markedQuestions[currentQuestion]) {
      setShowConfirmDialog(true)
      setShowError(false)
    } else {
      setShowError(true)
    }
  }

  const confirmSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/exam-displays/${examDisplayId}/end_session/`, {
        exam_session: sessionId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      setIsSubmitted(true)
      setShowConfirmDialog(false)
      console.log('Exam submission result:', response.data)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting exam:', error)
    }
  }

  const toggleCrossedOption = (optionIndex: number) => {
    const newCrossedOptions = [...crossedOptions]
    newCrossedOptions[currentQuestion][optionIndex] = !newCrossedOptions[currentQuestion][optionIndex]
    setCrossedOptions(newCrossedOptions)
  }

  const toggleAnnotation = () => {
    setIsAnnotationVisible(!isAnnotationVisible)
  }

  if (loadingError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-center mb-4">Error Loading Exam</h2>
            <p className="text-center mb-4">{loadingError}</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => router.push('/dashboard')}>
                Return to Dashboard
              </Button>
              <Button onClick={fetchExamData}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!examData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-center mb-4">Loading Exam Data...</h2>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestionData = examData.questions[currentQuestion]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">
      <div className="text-center py-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-3xl font-bold">{examData.name}</h1>
      </div>
      <div className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
        <Card className="flex-1 md:w-1/2">
          <CardContent className="p-6 h-[calc(100vh-8rem)] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Question</h2>
              <div className="text-xl font-semibold">{formatTime(timeLeft)}</div>
            </div>
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm md:text-base">{currentQuestionData.text}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 md:w-1/2 flex flex-col">
          <CardContent className="p-6 flex-grow overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Question {currentQuestion + 1}</h2>
              <div className="flex space-x-2">
                <Button
                  onClick={toggleAnnotation}
                  variant="outline"
                  size="sm"
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  {isAnnotationVisible ? 'Hide Annotation' : 'Annotate'}
                </Button>
                <Button onClick={handleMarkQuestion} variant={markedQuestions[currentQuestion] ? "secondary" : "outline"} size="sm">
                  <Flag className="h-4 w-4 mr-2" />
                  {markedQuestions[currentQuestion] ? 'Unmark' : 'Mark'}
                </Button>
              </div>
            </div>
            {currentQuestionData.question_type === 'multiple-choice' && (
              <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswerChange} className="space-y-2">
                {currentQuestionData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className={`text-sm md:text-base flex-grow ${crossedOptions[currentQuestion][index] ? 'line-through text-gray-400' : ''}`}
                    >
                      {option}
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCrossedOption(index)}
                      className="p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </RadioGroup>
            )}
            {(currentQuestionData.question_type === 'essay' || currentQuestionData.question_type === 'writing' || currentQuestionData.question_type === 'speaking') && (
              <Textarea
                placeholder="Write your answer here..."
                value={answers[currentQuestion]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-full h-32"
              />
            )}
            {showError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  Please select an answer or mark the question before moving to the next question.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <div className="p-6 border-t">
            <div className="flex justify-between items-center">
              <Button onClick={handlePreviousQuestion} disabled={currentQuestion === 0} size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              {currentQuestion === examData.questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={isSubmitted} size="sm">
                  Submit Exam
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} size="sm">
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {isAnnotationVisible && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t transition-all duration-300 ease-in-out">
          <Card>
            <CardContent className="p-4">
              <Textarea
                placeholder="Write your annotations here..."
                value={annotation}
                onChange={(e) => setAnnotation(e.target.value)}
                className="w-full h-32"
              />
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your exam? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSubmit}>
              Confirm Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}