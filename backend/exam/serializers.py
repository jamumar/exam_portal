from rest_framework import serializers
from .models import (
    SATExam, SATSection, SATModule, SATQuestion, SATExamSubmission,
    GREExam, GRESection, GREModule, GREQuestion, GREExamSubmission,
    GMATExam, GMATSection, GMATModule, GMATQuestion, GMATExamSubmission,
    IELTSExam, IELTSSection, IELTSModule, IELTSQuestion, IELTSExamSubmission
)

class BaseQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ['id', 'text', 'question_type', 'passage', 'options', 'correct_answer', 'explanation', 'unit', 'order']

class BaseModuleSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ['id', 'name', 'duration', 'question_count', 'difficulty', 'order', 'questions']

class BaseSectionSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ['id', 'name', 'order', 'modules']

class BaseExamSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ['id', 'name', 'created_at', 'updated_at', 'exam_type', 'sections']

class SATQuestionSerializer(BaseQuestionSerializer):
    class Meta(BaseQuestionSerializer.Meta):
        model = SATQuestion

class SATModuleSerializer(BaseModuleSerializer):
    questions = SATQuestionSerializer(many=True, read_only=True)

    class Meta(BaseModuleSerializer.Meta):
        model = SATModule

class SATSectionSerializer(BaseSectionSerializer):
    modules = SATModuleSerializer(many=True, read_only=True)

    class Meta(BaseSectionSerializer.Meta):
        model = SATSection

class SATExamSerializer(BaseExamSerializer):
    sections = SATSectionSerializer(many=True, read_only=True)

    class Meta(BaseExamSerializer.Meta):
        model = SATExam
    

class SATExamSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SATExamSubmission
        fields = ['id', 'exam', 'user', 'verbal_score', 'math_score', 'total_score', 'submitted_at']

class GREQuestionSerializer(BaseQuestionSerializer):
    class Meta(BaseQuestionSerializer.Meta):
        model = GREQuestion

class GREModuleSerializer(BaseModuleSerializer):
    questions = GREQuestionSerializer(many=True, read_only=True)

    class Meta(BaseModuleSerializer.Meta):
        model = GREModule

class GRESectionSerializer(BaseSectionSerializer):
    modules = GREModuleSerializer(many=True, read_only=True)

    class Meta(BaseSectionSerializer.Meta):
        model = GRESection

class GREExamSerializer(BaseExamSerializer):
    sections = GRESectionSerializer(many=True, read_only=True)

    class Meta(BaseExamSerializer.Meta):
        model = GREExam

class GREExamSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GREExamSubmission
        fields = ['id', 'exam', 'user', 'verbal_score', 'math_score', 'total_score', 'submitted_at']

class GMATQuestionSerializer(BaseQuestionSerializer):
    class Meta(BaseQuestionSerializer.Meta):
        model = GMATQuestion

class GMATModuleSerializer(BaseModuleSerializer):
    questions = GMATQuestionSerializer(many=True, read_only=True)

    class Meta(BaseModuleSerializer.Meta):
        model = GMATModule

class GMATSectionSerializer(BaseSectionSerializer):
    modules = GMATModuleSerializer(many=True, read_only=True)

    class Meta(BaseSectionSerializer.Meta):
        model = GMATSection

class GMATExamSerializer(BaseExamSerializer):
    sections = GMATSectionSerializer(many=True, read_only=True)

    class Meta(BaseExamSerializer.Meta):
        model = GMATExam

class GMATExamSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GMATExamSubmission
        fields = ['id', 'exam', 'user', 'verbal_score', 'quant_score', 'di_score', 'total_score', 'submitted_at']
class IELTSQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IELTSQuestion
        fields = ['id', 'text', 'passage', 'options', 'correct_answer', 'explanation', 'question_type', 'sub_type', 'unit', 'graph_description', 'image', 'set']

class IELTSModuleSerializer(serializers.ModelSerializer):
    questions = IELTSQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = IELTSModule
        fields = ['id', 'name', 'duration', 'question_count', 'order', 'difficulty', 'questions']

class IELTSSectionSerializer(serializers.ModelSerializer):
    modules = IELTSModuleSerializer(many=True, read_only=True)

    class Meta:
        model = IELTSSection
        fields = ['id', 'name', 'order', 'modules']

class IELTSExamSerializer(serializers.ModelSerializer):
    sections = IELTSSectionSerializer(many=True, read_only=True)
    ielts_type = serializers.ChoiceField(choices=IELTSExam.EXAM_TYPE_CHOICES)

    class Meta:
        model = IELTSExam
        fields = ['id', 'name', 'exam_type', 'ielts_type', 'sections', 'created_at', 'updated_at']

class IELTSExamSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IELTSExamSubmission
        fields = ['id', 'exam', 'user', 'listening_score', 'reading_score', 'writing_score', 'speaking_score', 'overall_score', 'submitted_at']