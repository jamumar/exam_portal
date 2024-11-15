from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    test_type = models.CharField(
        max_length=50,
        choices=[
            ('gmat', 'GMAT'),
            ('gre', 'GRE'),
            ('sat', 'SAT'),
            ('ielts', 'IELTS'),
        ],
        blank=True,
    )
    registration_date = models.DateTimeField(auto_now_add=True)
    groups = models.ManyToManyField(Group, related_name='customuser_set', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='customuser_set', blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    

class Exam(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[
        ('Not Started', 'Not Started'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ], default='Not Started')
    score = models.IntegerField(null=True, blank=True)
    time_taken = models.DurationField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"    