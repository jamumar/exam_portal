# Generated by Django 5.1.2 on 2024-11-11 03:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('exam', '0003_gmatmodule_gremodule_ieltsmodule_satmodule_and_more'),
        ('exam_display', '0002_remove_examsession_content_type_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Question',
        ),
        migrations.DeleteModel(
            name='Section',
        ),
    ]
