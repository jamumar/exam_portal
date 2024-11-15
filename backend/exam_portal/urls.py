# exam_portal/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/', include('exam.urls')),
    path('api/', include('exam_display.urls')),
    path('api/student/dashboard/', include('student_dashboard.urls')),
]