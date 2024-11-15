import ExamTypeDetails from '@/components/exam-type-details'
import { GraduationCap } from 'lucide-react'

export default function GREExamsPage() {
  return <ExamTypeDetails examType="GRE" icon={<GraduationCap className="mr-2 h-6 w-6" />} />
}