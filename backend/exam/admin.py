from django.contrib import admin
from .models import (
    SATExam, SATSection, SATModule, SATQuestion, SATExamSubmission,
    GREExam, GRESection, GREModule, GREQuestion, GREExamSubmission,
    GMATExam, GMATSection, GMATModule, GMATQuestion, GMATExamSubmission,
    IELTSExam, IELTSSection, IELTSModule, IELTSQuestion, IELTSExamSubmission
)

# SAT Admin
admin.site.register(SATExam)
admin.site.register(SATSection)
admin.site.register(SATModule)
admin.site.register(SATQuestion)
admin.site.register(SATExamSubmission)

# GRE Admin
admin.site.register(GREExam)
admin.site.register(GRESection)
admin.site.register(GREModule)
admin.site.register(GREQuestion)
admin.site.register(GREExamSubmission)

# GMAT Admin
admin.site.register(GMATExam)
admin.site.register(GMATSection)
admin.site.register(GMATModule)
admin.site.register(GMATQuestion)
admin.site.register(GMATExamSubmission)

# IELTS Admin
admin.site.register(IELTSExam)
admin.site.register(IELTSSection)
admin.site.register(IELTSModule)
admin.site.register(IELTSQuestion)
admin.site.register(IELTSExamSubmission)