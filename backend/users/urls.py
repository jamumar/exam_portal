from django.urls import path
from .views import RegisterView, login_view, get_user_data, student_exams, start_exam, student_performance, logout_view, admin_login_view

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('user/', get_user_data, name='user_data'),
    path('student/exams/', student_exams, name='student_exams'),
    path('student/start-exam/<int:exam_id>/', start_exam, name='start_exam'),
    path('student/performance/', student_performance, name='student_performance'),
    path('logout/', logout_view, name='logout'),
    path('admin/login/', admin_login_view, name='admin_login'),
]