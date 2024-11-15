from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Count
from .models import (
    SATExam, SATSection, SATModule, SATQuestion, SATExamSubmission,
    GREExam, GRESection, GREModule, GREQuestion, GREExamSubmission,
    GMATExam, GMATSection, GMATModule, GMATQuestion, GMATExamSubmission,
    IELTSExam, IELTSSection, IELTSModule, IELTSQuestion, IELTSExamSubmission,
    Activity
)
from .serializers import (
    SATExamSerializer, SATSectionSerializer, SATModuleSerializer, SATQuestionSerializer, SATExamSubmissionSerializer,
    GREExamSerializer, GRESectionSerializer, GREModuleSerializer, GREQuestionSerializer, GREExamSubmissionSerializer,
    GMATExamSerializer, GMATSectionSerializer, GMATModuleSerializer, GMATQuestionSerializer, GMATExamSubmissionSerializer,
    IELTSExamSerializer, IELTSSectionSerializer, IELTSModuleSerializer, IELTSQuestionSerializer, IELTSExamSubmissionSerializer
)

class ActivityLoggingMixin:
    activity_model_name = "Unknown"

    def perform_create(self, serializer):
        instance = serializer.save()
        Activity.objects.create(
            action=f"Created {self.activity_model_name}",
            details=f"{self.activity_model_name} '{instance}' was created"
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        Activity.objects.create(
            action=f"Updated {self.activity_model_name}",
            details=f"{self.activity_model_name} '{instance}' was updated"
        )

    def perform_destroy(self, instance):
        Activity.objects.create(
            action=f"Deleted {self.activity_model_name}",
            details=f"{self.activity_model_name} '{instance}' was deleted"
        )
        instance.delete()

class BaseExamViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    @action(detail=True, methods=['post'])
    def submit_exam(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        scores = request.data.get('scores', {})
        
        if not all(score in scores for score in self.required_scores):
            return Response({"error": f"All scores ({', '.join(self.required_scores)}) are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        total_score = self.calculate_total_score(scores)
        
        submission = self.submission_model.objects.create(
            exam=exam,
            user=user,
            total_score=total_score,
            **{score: scores[score] for score in self.required_scores}
        )
        
        serializer = self.submission_serializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def get_next_module(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        section_id = request.query_params.get('section_id')
        previous_module_id = request.query_params.get('previous_module_id')
        previous_score = request.query_params.get('previous_score')

        if not section_id:
            return Response({"error": "Section ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        section = exam.sections.get(id=section_id)
        
        if previous_module_id and previous_score:
            previous_module = section.modules.get(id=previous_module_id)
            next_difficulty = self.determine_next_difficulty(int(previous_score), previous_module.question_count)
        else:
            next_difficulty = 'standard'

        next_module = section.modules.filter(difficulty=next_difficulty).first()

        if not next_module:
            next_module = section.modules.filter(difficulty='standard').first()

        if not next_module:
            return Response({"message": "No more modules available"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_module_serializer()(next_module)
        return Response(serializer.data)

    def determine_next_difficulty(self, previous_score, question_count):
        score_percentage = (previous_score / question_count) * 100
        if score_percentage >= 70:
            return 'hard'
        elif score_percentage <= 30:
            return 'easy'
        else:
            return 'standard'

    def get_module_serializer(self):
        raise NotImplementedError("Subclasses must implement this method")

class BaseQuestionViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        module_id = request.data.get('module')
        if not module_id:
            return Response({"error": "Module ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            module = self.get_module_model().objects.get(id=module_id)
        except self.get_module_model().DoesNotExist:
            return Response({"error": "Invalid module ID"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer, request)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer, request):
        serializer.save(module_id=request.data.get('module'))

    def get_module_model(self):
        raise NotImplementedError("Subclasses must implement this method")

class SATExamViewSet(BaseExamViewSet):
    queryset = SATExam.objects.all()
    serializer_class = SATExamSerializer
    submission_model = SATExamSubmission
    submission_serializer = SATExamSubmissionSerializer
    required_scores = ['verbal_score', 'math_score']
    activity_model_name = "SAT Exam"

    @action(detail=True, methods=['post'])
    def create_structure(self, request, pk=None):
        exam = self.get_object()
        
        verbal_section = SATSection.objects.create(exam=exam, name='verbal', order=1)
        SATModule.objects.create(section=verbal_section, name='reading_standard', duration=32, question_count=27, order=1, difficulty='standard')
        SATModule.objects.create(section=verbal_section, name='writing_standard', duration=32, question_count=27, order=2, difficulty='standard')
        
        math_section = SATSection.objects.create(exam=exam, name='math', order=2)
        SATModule.objects.create(section=math_section, name='math1_standard', duration=35, question_count=22, order=1, difficulty='standard')
        SATModule.objects.create(section=math_section, name='math2_standard', duration=35, question_count=22, order=2, difficulty='standard')
        
        return Response({"message": "SAT exam structure created successfully"}, status=status.HTTP_201_CREATED)

    def calculate_total_score(self, scores):
        reading_writing_score = scores['verbal_score']
        math_score = scores['math_score']
        combined_score = reading_writing_score + math_score
        return round(400 + ((combined_score - 400) / 1200) * 1200)

    def get_module_serializer(self):
        return SATModuleSerializer

class GREExamViewSet(BaseExamViewSet):
    queryset = GREExam.objects.all()
    serializer_class = GREExamSerializer
    submission_model = GREExamSubmission
    submission_serializer = GREExamSubmissionSerializer
    required_scores = ['verbal_score', 'math_score']
    activity_model_name = "GRE Exam"

    @action(detail=True, methods=['post'])
    def create_structure(self, request, pk=None):
        exam = self.get_object()
        
        verbal_section = GRESection.objects.create(exam=exam, name='verbal', order=1)
        GREModule.objects.create(section=verbal_section, name='verbal1_standard', duration=18, question_count=12, order=1, difficulty='standard')
        GREModule.objects.create(section=verbal_section, name='verbal2_standard', duration=23, question_count=15, order=2, difficulty='standard')
        
        math_section = GRESection.objects.create(exam=exam, name='math', order=2)
        GREModule.objects.create(section=math_section, name='math1_standard', duration=21, question_count=22, order=1, difficulty='standard')
        GREModule.objects.create(section=math_section, name='math2_standard', duration=26, question_count=22, order=2, difficulty='standard')
        
        return Response({"message": "GRE exam structure created successfully"}, status=status.HTTP_201_CREATED)

    def calculate_total_score(self, scores):
        total_scaled_score = scores['verbal_score'] + scores['math_score']
        return round(260 + ((total_scaled_score - 260) / 80) * 80)

    def get_module_serializer(self):
        return GREModuleSerializer

class GMATExamViewSet(BaseExamViewSet):
    queryset = GMATExam.objects.all()
    serializer_class = GMATExamSerializer
    submission_model = GMATExamSubmission
    submission_serializer = GMATExamSubmissionSerializer
    required_scores = ['verbal_score', 'quant_score', 'di_score']
    activity_model_name = "GMAT Exam"

    @action(detail=True, methods=['post'])
    def create_structure(self, request, pk=None):
        exam = self.get_object()
    
        sections = [
            ('verbal', 'Verbal', 23, 45),
            ('quant', 'Quantitative', 21, 45),
            ('di', 'Data Interpretation', 20, 45)
        ]
    
        for order, (name, display_name, question_count, duration) in enumerate(sections, start=1):
            section = GMATSection.objects.create(exam=exam, name=name, order=order)
            GMATModule.objects.create(
                section=section,
                name=f"{display_name}",
                duration=duration,
                question_count=question_count,
                order=1,
                difficulty='standard'
            )
    
        return Response({"message": "GMAT exam structure created successfully"}, status=status.HTTP_201_CREATED)

    def calculate_total_score(self, scores):
        total_scaled_score = scores['verbal_score'] + scores['quant_score'] + scores['di_score']
        return round(205 + ((total_scaled_score - 60) / 30) * 600)

    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        question_id = request.data.get('question_id')
        answer = request.data.get('answer')
        
        if not question_id or not answer:
            return Response({"error": "Question ID and answer are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        question = GMATQuestion.objects.get(id=question_id)
        is_correct = answer == question.correct_answer
        
        # Update question weight based on correctness
        if is_correct:
            question.weight *= 1.2
        else:
            question.weight *= 0.8
        question.save()
        
        # Get next question based on updated weights
        next_question = GMATQuestion.objects.filter(module__section__exam=exam).order_by('-weight').first()
        
        serializer = GMATQuestionSerializer(next_question)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def change_answer(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        question_id = request.data.get('question_id')
        new_answer = request.data.get('new_answer')
        
        if not question_id or not new_answer:
            return Response({"error": "Question ID and new answer are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        submission = GMATExamSubmission.objects.get(exam=exam, user=user)
        
        if submission.changes_made >= 3:
            return Response({"error": "Maximum number of answer changes reached"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Logic to change the answer
        question = GMATQuestion.objects.get(id=question_id)
        old_answer = submission.answers.get(question_id, None)
        submission.answers[question_id] = new_answer
        submission.save()
        
        # Update question weight if the answer was changed from incorrect to correct or vice versa
        if old_answer != new_answer:
            if new_answer == question.correct_answer:
                question.weight *= 1.2
            else:
                question.weight *= 0.8
            question.save()
        
        submission.changes_made += 1
        submission.save()
        
        return Response({"message": "Answer changed successfully"}, status=status.HTTP_200_OK)

    def get_module_serializer(self):
        return GMATModuleSerializer

class IELTSExamViewSet(BaseExamViewSet):
    queryset = IELTSExam.objects.all()
    serializer_class = IELTSExamSerializer
    submission_model = IELTSExamSubmission
    submission_serializer = IELTSExamSubmissionSerializer
    required_scores = ['listening_score', 'reading_score', 'writing_score', 'speaking_score']
    activity_model_name = "IELTS Exam"

    @action(detail=True, methods=['post'])
    def create_structure(self, request, pk=None):
        exam = self.get_object()
        
        sections = [
            ('listening', 'Listening'),
            ('reading', 'Reading'),
            ('writing', 'Writing'),
            ('speaking', 'Speaking')
        ]
        
        for order, (name, display_name) in enumerate(sections, start=1):
            section = IELTSSection.objects.create(exam=exam, name=name, order=order)
            IELTSModule.objects.create(section=section, name=f"{display_name}_standard", duration=60, question_count=40, order=1, difficulty='standard')
        
        return Response({"message": "IELTS exam structure created successfully"}, status=status.HTTP_201_CREATED)

    def calculate_total_score(self, scores):
        total_score = sum(scores.values()) / len(scores)
        return round(total_score * 2) / 2  # Round to nearest 0.5

    def get_module_serializer(self):
        return IELTSModuleSerializer

class SATSectionViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    queryset = SATSection.objects.all()
    serializer_class = SATSectionSerializer
    activity_model_name = "SAT Section"

class SATModuleViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    queryset = SATModule.objects.all()
    serializer_class = SATModuleSerializer
    activity_model_name = "SAT Module"

class SATQuestionViewSet(BaseQuestionViewSet):
    queryset = SATQuestion.objects.all()
    serializer_class = SATQuestionSerializer
    activity_model_name = "SAT Question"

    def get_module_model(self):
        return SATModule

class GRESectionViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    queryset = GRESection.objects.all()
    serializer_class = GRESectionSerializer
    activity_model_name = "GRE Section"

class GREModuleViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    queryset = GREModule.objects.all()
    serializer_class = GREModuleSerializer
    activity_model_name = "GRE Module"

class GREQuestionViewSet(BaseQuestionViewSet):
    queryset = GREQuestion.objects.all()
    serializer_class = GREQuestionSerializer
    activity_model_name = "GRE Question"

    def get_module_model(self):
        return GREModule

class GMATSectionViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    queryset = GMATSection.objects.all()
    serializer_class = GMATSectionSerializer
    activity_model_name = "GMAT Section"

class GMATModuleViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    queryset = GMATModule.objects.all()
    serializer_class = GMATModuleSerializer
    activity_model_name = "GMAT Module"

class GMATQuestionViewSet(BaseQuestionViewSet):
    queryset = GMATQuestion.objects.all()
    serializer_class = GMATQuestionSerializer
    activity_model_name = "GMAT Question"

    def get_module_model(self):
        return GMATModule

class IELTSSectionViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    queryset = IELTSSection.objects.all()
    serializer_class = IELTSSectionSerializer
    activity_model_name = "IELTS Section"

class IELTSModuleViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    queryset = IELTSModule.objects.all()
    serializer_class = IELTSModuleSerializer
    activity_model_name = "IELTS Module"

class IELTSQuestionViewSet(BaseQuestionViewSet):
    queryset = IELTSQuestion.objects.all()
    serializer_class = IELTSQuestionSerializer
    activity_model_name = "IELTS Question"

    def get_module_model(self):
        return IELTSModule

@api_view(['GET'])
def exam_stats(request):
    exam_counts = {
        'SAT': SATExam.objects.count(),
        'GRE': GREExam.objects.count(),
        'GMAT': GMATExam.objects.count(),
        'IELTS': IELTSExam.objects.count()
    }
    total_questions = (
        SATQuestion.objects.count() +
        GREQuestion.objects.count() +
        GMATQuestion.objects.count() +
        IELTSQuestion.objects.count()
    )
    
    stats = {
        'exam_counts': exam_counts,
        'total_questions': total_questions
    }
    
    return Response(stats)

@api_view(['GET'])
def recent_activities(request):
    activities = Activity.objects.order_by('-timestamp')[:10]  # Get last 10 activities
    
    activity_list = [
        {
            'id': activity.id,
            'action': activity.action,
            'details': activity.details,
            'timestamp': activity.timestamp.isoformat()
        }
        for activity in activities
    ]
    
    return Response(activity_list)