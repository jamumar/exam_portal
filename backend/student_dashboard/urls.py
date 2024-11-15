from django.urls import path
from . import views

urlpatterns = [
    path('', views.student_dashboard, name='student_dashboard'),
     path('<str:exam_type>-exams/<int:exam_id>/start-exam/', views.start_exam, name='start_exam'),
]
