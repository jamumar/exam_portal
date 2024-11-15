from rest_framework import serializers
from .models import ExamDisplay, ExamSession, UserAnswer
from exam.models import (
    SATExam, SATQuestion, SATExamSubmission,
    GREExam, GREQuestion, GREExamSubmission,
    GMATExam, GMATQuestion, GMATExamSubmission,
    IELTSExam, IELTSQuestion, IELTSExamSubmission
)

class ExamDisplaySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamDisplay
        fields = '__all__'

class ExamSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamSession
        fields = '__all__'

class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = '__all__'

class SATQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SATQuestion
        fields = ['id', 'text', 'question_type', 'options']

class GREQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GREQuestion
        fields = ['id', 'text', 'question_type', 'options']

class GMATQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GMATQuestion
        fields = ['id', 'text', 'question_type', 'options']

class IELTSQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IELTSQuestion
        fields = ['id', 'text', 'question_type', 'options']

class SATExamSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SATExamSubmission
        fields = '__all__'

class GREExamSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GREExamSubmission
        fields = '__all__'

class GMATExamSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GMATExamSubmission
        fields = '__all__'

class IELTSExamSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IELTSExamSubmission
        fields = '__all__'