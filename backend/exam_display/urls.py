from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamDisplayViewSet

router = DefaultRouter()
router.register(r'exam-displays', ExamDisplayViewSet)

urlpatterns = [
    path('', include(router.urls)),
]