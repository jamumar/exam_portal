from typing import Dict, Any, Optional
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, ExamSerializer, AdminLoginSerializer
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated 
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Exam

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

@csrf_exempt
@api_view(['POST'])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        validated_data: Optional[Dict[str, Any]] = serializer.validated_data if isinstance(serializer.validated_data, dict) else None
        
        if validated_data:
            email = validated_data.get('email')
            password = validated_data.get('password')

            if email and password:
                try:
                    user = User.objects.get(email=email)
                    if user.check_password(password):
                        refresh = RefreshToken.for_user(user)
                        access_token = getattr(refresh, 'access_token', None)
                        
                        return Response({
                            'refresh': str(refresh),
                            'access': str(access_token),
                            'user': UserSerializer(user).data
                        })
                    else:
                        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
                except User.DoesNotExist:
                    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    try:
        users = User.objects.filter(is_staff=False)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_exams(request):
    exams = Exam.objects.filter(user=request.user)
    serializer = ExamSerializer(exams, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_exam(request, exam_id):
    try:
        exam = Exam.objects.get(id=exam_id, user=request.user)
        if exam.status == 'Not Started':
            exam.status = 'In Progress'
            exam.save()
        return Response({'status': 'success', 'message': 'Exam started successfully'})
    except Exam.DoesNotExist:
        return Response({'status': 'error', 'message': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_performance(request):
    # This is a placeholder implementation. You should replace this with actual data from your database.
    performance_data = [
        {"section": "Reading", "score": 80},
        {"section": "Writing", "score": 75},
        {"section": "Math", "score": 85},
        {"section": "Science", "score": 78},
    ]
    return Response(performance_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"success": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
    except TokenError:
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def admin_login_view(request):
    serializer = AdminLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        validated_data: Optional[Dict[str, Any]] = serializer.validated_data if isinstance(serializer.validated_data, dict) else None
        
        if validated_data:
            email = validated_data.get('email')
            password = validated_data.get('password')

            if email and password:
                try:
                    user = User.objects.get(email=email, is_staff=True)
                    if user.check_password(password):
                        refresh = RefreshToken.for_user(user)
                        access_token = getattr(refresh, 'access_token', None)
                        
                        return Response({
                            'refresh': str(refresh),
                            'access': str(access_token),
                        })
                    else:
                        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
                except User.DoesNotExist:
                    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    try:
        recent_tests = Exam.objects.filter(user=request.user).order_by('-id')[:5]
        upcoming_tests = Exam.objects.filter(user=request.user, status='Not Started').order_by('id')[:5]
        performance_data = [
            {"section": "Reading", "score": 80},
            {"section": "Writing", "score": 75},
            {"section": "Math", "score": 85},
            {"section": "Science", "score": 78},
        ]

        data = {
            "recentTests": ExamSerializer(recent_tests, many=True).data,
            "upcomingTests": ExamSerializer(upcoming_tests, many=True).data,
            "performanceData": performance_data,
        }
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)