from rest_framework import serializers
from users.models import Exam, CustomUser

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['id', 'name', 'status', 'score', 'time_taken']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'test_type', 'registration_date']

class StudentDashboardSerializer(serializers.Serializer):
    user = UserSerializer()
    recent_tests = ExamSerializer(many=True)
    upcoming_tests = ExamSerializer(many=True)
    performance_data = serializers.ListField(child=serializers.DictField())