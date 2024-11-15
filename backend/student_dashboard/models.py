from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class StudentExam(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exam_type = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    score = models.IntegerField()
    time_taken = models.DurationField()
    status = models.CharField(max_length=50)
    date = models.DateTimeField(auto_now_add=True)

class UpcomingExam(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exam_type = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    date = models.DateTimeField()
    duration = models.DurationField()

class PerformanceData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exam_type = models.CharField(max_length=50)
    section = models.CharField(max_length=255)
    score = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)