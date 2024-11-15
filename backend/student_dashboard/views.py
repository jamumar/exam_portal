from django.utils import timezone
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from users.models import Exam, CustomUser
from .serializers import StudentDashboardSerializer
from .models import StudentExam

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    try:
        user = request.user
        
        # Get recent tests
        recent_tests = Exam.objects.filter(user=user).order_by('-id')[:5]
        
        # Get upcoming tests (assuming 'Not Started' status means upcoming)
        upcoming_tests = Exam.objects.filter(user=user, status='Not Started').order_by('id')[:5]
        
        # Get performance data
        completed_exams = Exam.objects.filter(user=user, status='Completed')
        total_exams = completed_exams.count()
        average_score = completed_exams.aggregate(Avg('score'))['score__avg'] if total_exams > 0 else 0
        
        performance_data = [
            {"section": "Total Exams", "score": total_exams},
            {"section": "Average Score", "score": round(average_score, 2) if average_score else 0},
        ]

        # Prepare data for serialization
        dashboard_data = {
            "user": user,
            "recent_tests": recent_tests,
            "upcoming_tests": upcoming_tests,
            "performance_data": performance_data,
        }

        # Serialize the data
        serializer = StudentDashboardSerializer(dashboard_data)

        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_exam(request, exam_type, exam_id):
    try:
        exam = get_object_or_404(Exam, id=exam_id, exam_type=exam_type)
        
        # Create a new StudentExam instance
        student_exam = StudentExam.objects.create(
            user=request.user,
            exam_type=exam_type,
            name=exam.name,
            status='In Progress'
        )
        
        return Response({
            'message': 'Exam started successfully',
            'exam_id': student_exam.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)