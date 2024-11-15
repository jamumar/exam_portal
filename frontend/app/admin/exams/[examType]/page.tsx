import React from 'react'
import ExamTypeDetails from '@/components/exam-type-details'
import { GraduationCap, BookOpen, PenTool, BarChart } from 'lucide-react'

export default function ExamTypePage({ params }: { params: { type: string } }) {
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sat':
        return <PenTool className="h-6 w-6" />
      case 'gre':
        return <GraduationCap className="h-6 w-6" />
      case 'gmat':
        return <BookOpen className="h-6 w-6" />
      case 'ielts':
        return <BarChart className="h-6 w-6" />
      default:
        return null
    }
  }

  return <ExamTypeDetails examType={params.type} icon={getIcon(params.type)} />
}