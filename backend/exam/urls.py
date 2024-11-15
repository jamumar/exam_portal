from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SATExamViewSet, SATSectionViewSet, SATModuleViewSet, SATQuestionViewSet,
    GREExamViewSet, GRESectionViewSet, GREModuleViewSet, GREQuestionViewSet,
    GMATExamViewSet, GMATSectionViewSet, GMATModuleViewSet, GMATQuestionViewSet,
    IELTSExamViewSet, IELTSSectionViewSet, IELTSModuleViewSet, IELTSQuestionViewSet,
        exam_stats, recent_activities, recent_activities
)

router = DefaultRouter()

router.register(r'sat-exams', SATExamViewSet)
router.register(r'sat-sections', SATSectionViewSet)
router.register(r'sat-modules', SATModuleViewSet)
router.register(r'sat-questions', SATQuestionViewSet)
router.register(r'gre-exams', GREExamViewSet)
router.register(r'gre-sections', GRESectionViewSet)
router.register(r'gre-modules', GREModuleViewSet)
router.register(r'gre-questions', GREQuestionViewSet)
router.register(r'gmat-exams', GMATExamViewSet)
router.register(r'gmat-sections', GMATSectionViewSet)
router.register(r'gmat-modules', GMATModuleViewSet)
router.register(r'gmat-questions', GMATQuestionViewSet)
router.register(r'ielts-exams', IELTSExamViewSet)
router.register(r'ielts-sections', IELTSSectionViewSet)
router.register(r'ielts-modules', IELTSModuleViewSet)
router.register(r'ielts-questions', IELTSQuestionViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('sat-exams/<int:pk>/create-structure/', SATExamViewSet.as_view({'post': 'create_structure'}), name='create-sat-structure'),
    path('sat-exams/<int:pk>/submit-exam/', SATExamViewSet.as_view({'post': 'submit_exam'}), name='submit-sat-exam'),
    path('sat-modules/<int:pk>/add-question/', SATModuleViewSet.as_view({'post': 'add_question'}), name='add-sat-question'),
    path('gre-exams/<int:pk>/create-structure/', GREExamViewSet.as_view({'post': 'create_structure'}), name='create-gre-structure'),
    path('gre-exams/<int:pk>/submit-exam/', GREExamViewSet.as_view({'post': 'submit_exam'}), name='submit-gre-exam'),
    path('gre-modules/<int:pk>/add-question/', GREModuleViewSet.as_view({'post': 'add_question'}), name='add-gre-question'),
    path('gmat-exams/<int:pk>/create-structure/', GMATExamViewSet.as_view({'post': 'create_structure'}), name='create-gmat-structure'),
    path('gmat-exams/<int:pk>/submit-exam/', GMATExamViewSet.as_view({'post': 'submit_exam'}), name='submit-gmat-exam'),
    path('gmat-modules/<int:pk>/add-question/', GMATModuleViewSet.as_view({'post': 'add_question'}), name='add-gmat-question'),
    path('ielts-exams/<int:pk>/create-structure/', IELTSExamViewSet.as_view({'post': 'create_structure'}), name='create-ielts-structure'),
    path('ielts-exams/<int:pk>/submit-exam/', IELTSExamViewSet.as_view({'post': 'submit_exam'}), name='submit-ielts-exam'),
    path('ielts-modules/<int:pk>/add-question/', IELTSModuleViewSet.as_view({'post': 'add_question'}), name='add-ielts-question'),
    path('exam-stats/', exam_stats, name='exam-stats'),
    path('recent-activities/', recent_activities, name='recent-activities'),

]