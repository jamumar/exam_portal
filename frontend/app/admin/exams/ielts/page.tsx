import ExamTypeDetails from '@/components/exam-type-details'
import { BarChart } from 'lucide-react'

export default function IELTSExamsPage() {
  return <ExamTypeDetails examType="IELTS" icon={<BarChart className="mr-2 h-6 w-6" />} />
}