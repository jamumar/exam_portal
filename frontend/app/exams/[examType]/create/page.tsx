'use client'

import { useParams } from 'next/navigation'
import ExamCreator from '@/components/exam-page'
import { BookOpen, BarChart2, Globe, GraduationCap } from 'lucide-react'

const examTypeIcons = {
  sat: BookOpen,
  gmat: BarChart2,
  ielts: Globe,
  gre: GraduationCap,
}

export default function CreateExamPage() {
  const params = useParams()
  const examType = params?.examType as string
  const Icon = examType && examType.toLowerCase() in examTypeIcons 
    ? examTypeIcons[examType.toLowerCase() as keyof typeof examTypeIcons] 
    : BookOpen

  return (
    <ExamCreator 
      examType={examType?.toUpperCase() as 'SAT' | 'GRE' | 'GMAT' | 'IELTS'}
      icon={<Icon className="mr-2 h-6 w-6" />} 
    />
  )
}