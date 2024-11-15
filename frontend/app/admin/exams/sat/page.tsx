import ExamTypeDetails from '@/components/exam-type-details'
import { PenTool } from 'lucide-react'

export default function SATExamsPage() {
  return <ExamTypeDetails examType="SAT" icon={<PenTool className="mr-2 h-6 w-6" />} />
}