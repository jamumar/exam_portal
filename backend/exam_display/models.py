from django.db import models
from django.contrib.auth import get_user_model
from exam.models import (
    SATExam, SATQuestion,
    GMATExam, GMATQuestion,
    GREExam, GREQuestion,
    IELTSExam, IELTSQuestion
)

User = get_user_model()

class ExamDisplay(models.Model):
    sat_exam = models.ForeignKey(SATExam, on_delete=models.CASCADE, null=True, blank=True)
    gmat_exam = models.ForeignKey(GMATExam, on_delete=models.CASCADE, null=True, blank=True)
    gre_exam = models.ForeignKey(GREExam, on_delete=models.CASCADE, null=True, blank=True)
    ielts_exam = models.ForeignKey(IELTSExam, on_delete=models.CASCADE, null=True, blank=True)

    def get_questions(self):
        if self.sat_exam:
            return SATQuestion.objects.filter(module__section__exam=self.sat_exam)
        elif self.gmat_exam:
            return GMATQuestion.objects.filter(module__section__exam=self.gmat_exam)
        elif self.gre_exam:
            return GREQuestion.objects.filter(module__section__exam=self.gre_exam)
        elif self.ielts_exam:
            return IELTSQuestion.objects.filter(module__section__exam=self.ielts_exam)
        return None

    def __str__(self):
        if self.sat_exam:
            return f"SAT Exam Display: {self.sat_exam.name}"
        elif self.gmat_exam:
            return f"GMAT Exam Display: {self.gmat_exam.name}"
        elif self.gre_exam:
            return f"GRE Exam Display: {self.gre_exam.name}"
        elif self.ielts_exam:
            return f"IELTS Exam Display: {self.ielts_exam.name}"
        return "Exam Display"

class ExamSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exam_display = models.ForeignKey(ExamDisplay, on_delete=models.CASCADE, null=True, blank=True)

    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Exam Session for {self.user.username} - {self.exam_display}"

class UserAnswer(models.Model):
    exam_session = models.ForeignKey(ExamSession, on_delete=models.CASCADE, related_name='user_answers')
    sat_question = models.ForeignKey(SATQuestion, on_delete=models.CASCADE, null=True, blank=True)
    gmat_question = models.ForeignKey(GMATQuestion, on_delete=models.CASCADE, null=True, blank=True)
    gre_question = models.ForeignKey(GREQuestion, on_delete=models.CASCADE, null=True, blank=True)
    ielts_question = models.ForeignKey(IELTSQuestion, on_delete=models.CASCADE, null=True, blank=True)
    answer = models.TextField()
    is_correct = models.BooleanField(null=True)

    def __str__(self):
        return f"Answer by {self.exam_session.user.username} for question"

    def get_question(self):
        return self.sat_question or self.gmat_question or self.gre_question or self.ielts_question
