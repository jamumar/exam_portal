from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import ExamDisplay, ExamSession, UserAnswer
from .serializers import (
    ExamDisplaySerializer, ExamSessionSerializer, UserAnswerSerializer,
    SATQuestionSerializer, GREQuestionSerializer, GMATQuestionSerializer, IELTSQuestionSerializer,
    SATExamSubmissionSerializer, GREExamSubmissionSerializer, GMATExamSubmissionSerializer, IELTSExamSubmissionSerializer
)
from exam.models import (
    SATExam, SATQuestion, SATExamSubmission,
    GREExam, GREQuestion, GREExamSubmission,
    GMATExam, GMATQuestion, GMATExamSubmission,
    IELTSExam, IELTSQuestion, IELTSExamSubmission
)

class ExamDisplayViewSet(viewsets.ModelViewSet):
    queryset = ExamDisplay.objects.all()
    serializer_class = ExamDisplaySerializer

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        exam_display = self.get_object()
        questions = exam_display.get_questions()
        
        if exam_display.sat_exam:
            serializer = SATQuestionSerializer(questions, many=True)
        elif exam_display.gre_exam:
            serializer = GREQuestionSerializer(questions, many=True)
        elif exam_display.gmat_exam:
            serializer = GMATQuestionSerializer(questions, many=True)
        elif exam_display.ielts_exam:
            serializer = IELTSQuestionSerializer(questions, many=True)
        else:
            return Response({"error": "Invalid exam type"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def start_session(self, request, pk=None):
        exam_display = self.get_object()
        user = request.user
        session = ExamSession.objects.create(user=user, exam_display=exam_display)
        serializer = ExamSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        exam_display = self.get_object()
        session = get_object_or_404(ExamSession, user=request.user, exam_display=exam_display, end_time__isnull=True)
        
        serializer = UserAnswerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(exam_session=session)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        exam_display = self.get_object()
        session = get_object_or_404(ExamSession, user=request.user, exam_display=exam_display, end_time__isnull=True)
        session.end_time = timezone.now()
        session.save()

        # Calculate scores and create exam submission
        if exam_display.sat_exam:
            submission = self.create_sat_submission(session)
            serializer = SATExamSubmissionSerializer(submission)
        elif exam_display.gre_exam:
            submission = self.create_gre_submission(session)
            serializer = GREExamSubmissionSerializer(submission)
        elif exam_display.gmat_exam:
            submission = self.create_gmat_submission(session)
            serializer = GMATExamSubmissionSerializer(submission)
        elif exam_display.ielts_exam:
            submission = self.create_ielts_submission(session)
            serializer = IELTSExamSubmissionSerializer(submission)
        else:
            return Response({"error": "Invalid exam type"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.data)

    def create_sat_submission(self, session):
        # Implement SAT scoring logic here
        verbal_score = 0  # Calculate verbal score
        math_score = 0  # Calculate math score
        total_score = verbal_score + math_score
        return SATExamSubmission.objects.create(
            user=session.user,
            exam=session.exam_display.sat_exam,
            verbal_score=verbal_score,
            math_score=math_score,
            total_score=total_score
        )

    def create_gre_submission(self, session):
        # Implement GRE scoring logic here
        verbal_score = 0  # Calculate verbal score
        math_score = 0  # Calculate math score
        total_score = verbal_score + math_score
        return GREExamSubmission.objects.create(
            user=session.user,
            exam=session.exam_display.gre_exam,
            verbal_score=verbal_score,
            math_score=math_score,
            total_score=total_score
        )

    def create_gmat_submission(self, session):
        # Implement GMAT scoring logic here
        verbal_score = 0  # Calculate verbal score
        quant_score = 0  # Calculate quant score
        dl_score = 0  # Calculate data literacy score
        total_score = verbal_score + quant_score + dl_score
        return GMATExamSubmission.objects.create(
            user=session.user,
            exam=session.exam_display.gmat_exam,
            verbal_score=verbal_score,
            quant_score=quant_score,
            dl_score=dl_score,
            total_score=total_score
        )

    def create_ielts_submission(self, session):
        # Implement IELTS scoring logic here
        listening_score = 0.0  # Calculate listening score
        reading_score = 0.0  # Calculate reading score
        writing_score = 0.0  # Calculate writing score
        speaking_score = 0.0  # Calculate speaking score
        overall_score = (listening_score + reading_score + writing_score + speaking_score) / 4
        return IELTSExamSubmission.objects.create(
            user=session.user,
            exam=session.exam_display.ielts_exam,
            listening_score=listening_score,
            reading_score=reading_score,
            writing_score=writing_score,
            speaking_score=speaking_score,
            overall_score=overall_score
        )