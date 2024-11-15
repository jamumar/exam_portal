from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator


User = get_user_model()

class Activity(models.Model):
    id = models.AutoField(primary_key=True)
    action = models.CharField(max_length=255)
    details = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} - {self.timestamp}"

class BaseExam(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    exam_type = models.CharField(max_length=50, editable=False)

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.exam_type.upper()} Exam: {self.name}"

class BaseSection(models.Model):
    name = models.CharField(max_length=50)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        abstract = True

    def __str__(self):
        return f"Section: {self.name}"

class BaseModule(models.Model):
    name = models.CharField(max_length=50)
    duration = models.PositiveIntegerField()  # in minutes
    question_count = models.PositiveIntegerField()
    difficulty = models.CharField(max_length=10, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ], default='medium')
    order = models.PositiveIntegerField(default=1)

    class Meta:
        abstract = True

    def __str__(self):
        return f"Module: {self.name}"

class BaseQuestion(models.Model):
    text = models.TextField()
    question_type = models.CharField(max_length=50, choices=[
        ('multiple-choice', 'Multiple Choice'),
        ('math', 'Math'),
        ('writing', 'Writing'),
        ('speaking', 'Speaking'),
    ])
    passage = models.TextField(blank=True)
    options = models.JSONField(default=dict)
    correct_answer = models.CharField(max_length=1, choices=[
        ('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')
    ], blank=True)
    explanation = models.TextField(blank=True)
    unit = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=1)
    weight = models.FloatField(default=1.0)  # New field for GMAT adaptive scoring

    class Meta:
        abstract = True

    def __str__(self):
        return f"Question: {self.text[:50]}..."

class BaseExamSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"Submission by {self.user.username}"

# SAT Exam Models
class SATExam(BaseExam):
    exam_type = models.CharField(max_length=50, default='sat', editable=False)

class SATSection(BaseSection):
    SECTION_CHOICES = [
        ('verbal', 'Verbal'),
        ('math', 'Math'),
    ]
    exam = models.ForeignKey(SATExam, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=50, choices=SECTION_CHOICES)

    def __str__(self):
        return f"{self.exam.name} - {self.name}"

class SATModule(BaseModule):
    MODULE_CHOICES = [
        ('reading', 'Reading'),
        ('writing', 'Writing'),
        ('math1', 'Math 1'),
        ('math2', 'Math 2'),
    ]
    section = models.ForeignKey(SATSection, on_delete=models.CASCADE, related_name='modules')
    name = models.CharField(max_length=50, choices=MODULE_CHOICES)

    def __str__(self):
        return f"{self.section.exam.name} - {self.section.name} - {self.name}"

class SATQuestion(BaseQuestion):
    module = models.ForeignKey(SATModule, on_delete=models.CASCADE, related_name='questions')

    def __str__(self):
        return f"{self.module.section.exam.name} - {self.module.name} - Question {self.order}"

class SATExamSubmission(BaseExamSubmission):
    exam = models.ForeignKey(SATExam, on_delete=models.CASCADE, related_name='submissions')
    verbal_score = models.PositiveIntegerField()
    math_score = models.PositiveIntegerField()
    total_score = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.user.username} - {self.exam.name} - Total Score: {self.total_score}"

# GRE Exam Models
class GREExam(BaseExam):
    exam_type = models.CharField(max_length=50, default='gre', editable=False)

class GRESection(BaseSection):
    SECTION_CHOICES = [
        ('verbal', 'Verbal'),
        ('math', 'Math'),
    ]
    exam = models.ForeignKey(GREExam, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=50, choices=SECTION_CHOICES)

    def __str__(self):
        return f"{self.exam.name} - {self.name}"

class GREModule(BaseModule):
    MODULE_CHOICES = [
        ('verbal1', 'Verbal 1'),
        ('verbal2', 'Verbal 2'),
        ('math1', 'Math 1'),
        ('math2', 'Math 2'),
    ]
    section = models.ForeignKey(GRESection, on_delete=models.CASCADE, related_name='modules')
    name = models.CharField(max_length=50, choices=MODULE_CHOICES)

    def __str__(self):
        return f"{self.section.exam.name} - {self.section.name} - {self.name}"

class GREQuestion(BaseQuestion):
    module = models.ForeignKey(GREModule, on_delete=models.CASCADE, related_name='questions')

    def __str__(self):
        return f"{self.module.section.exam.name} - {self.module.name} - Question {self.order}"

class GREExamSubmission(BaseExamSubmission):
    exam = models.ForeignKey(GREExam, on_delete=models.CASCADE, related_name='submissions')
    verbal_score = models.PositiveIntegerField()
    math_score = models.PositiveIntegerField()
    total_score = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.user.username} - {self.exam.name} - Total Score: {self.total_score}"

# GMAT Exam Models
class GMATExam(BaseExam):
    exam_type = models.CharField(max_length=50, default='gmat', editable=False)

class GMATSection(BaseSection):
    SECTION_CHOICES = [
        ('verbal', 'Verbal'),
        ('quant', 'Quantitative'),
        ('dl', 'Data Literacy'),
    ]
    exam = models.ForeignKey(GMATExam, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=50, choices=SECTION_CHOICES)

    def __str__(self):
        return f"{self.exam.name} - {self.name}"

class GMATModule(BaseModule):
    MODULE_CHOICES = [
        ('verbal', 'Verbal'),
        ('quant', 'Quantitative'),
        ('dl', 'Data Literacy'),
    ]
    section = models.ForeignKey(GMATSection, on_delete=models.CASCADE, related_name='modules')
    name = models.CharField(max_length=50, choices=MODULE_CHOICES)

    def __str__(self):
        return f"{self.section.exam.name} - {self.section.name} - {self.name}"

class GMATQuestion(BaseQuestion):
    module = models.ForeignKey(GMATModule, on_delete=models.CASCADE, related_name='questions')

    def __str__(self):
        return f"{self.module.section.exam.name} - {self.module.name} - Question {self.order}"

class GMATExamSubmission(BaseExamSubmission):
    exam = models.ForeignKey(GMATExam, on_delete=models.CASCADE, related_name='submissions')
    verbal_score = models.PositiveIntegerField()
    quant_score = models.PositiveIntegerField()
    dl_score = models.PositiveIntegerField()
    total_score = models.PositiveIntegerField()
    changes_made = models.PositiveIntegerField(default=0)  # Track number of answer changes

    def __str__(self):
        return f"{self.user.username} - {self.exam.name} - Total Score: {self.total_score}"



# IELTS Exam Models
class IELTSExam(BaseExam):
    exam_type = models.CharField(max_length=50, default='ielts', editable=False)
    EXAM_TYPE_CHOICES = [
        ('academic', 'Academic'),
        ('general', 'General Training'),
    ]
    ielts_type = models.CharField(max_length=10, choices=EXAM_TYPE_CHOICES, default='academic')

class IELTSSection(BaseSection):
    SECTION_CHOICES = [
        ('listening', 'Listening'),
        ('reading', 'Reading'),
        ('writing', 'Writing'),
        ('speaking', 'Speaking'),
    ]
    exam = models.ForeignKey(IELTSExam, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=50, choices=SECTION_CHOICES)

class IELTSModule(BaseModule):
    section = models.ForeignKey(IELTSSection, on_delete=models.CASCADE, related_name='modules')

class IELTSQuestion(BaseQuestion):
    module = models.ForeignKey(IELTSModule, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=50, choices=[
        ('multiple-choice', 'Multiple Choice'),
        ('fill-in-the-blank', 'Fill in the Blank'),
        ('writing', 'Writing'),
        ('speaking', 'Speaking'),
    ])

class IELTSExamSubmission(BaseExamSubmission):
    exam = models.ForeignKey(IELTSExam, on_delete=models.CASCADE, related_name='submissions')
    listening_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(9)])
    reading_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(9)])
    writing_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(9)])
    speaking_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(9)])
    overall_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(9)])