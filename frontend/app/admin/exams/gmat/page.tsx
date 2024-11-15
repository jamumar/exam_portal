// import ExamCreator from '@/components/exam-page'
import ExamTypeDetails from '@/components/exam-type-details'
import { BookOpen } from 'lucide-react'

export default function GMATExamsPage() {
  return <ExamTypeDetails examType="GMAT" icon={<BookOpen className="mr-2 h-6 w-6" />} />
}