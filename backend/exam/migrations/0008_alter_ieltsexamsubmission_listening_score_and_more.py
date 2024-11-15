# Generated by Django 5.1.2 on 2024-11-15 02:28

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exam', '0007_gmatexamsubmission_changes_made_gmatquestion_weight_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ieltsexamsubmission',
            name='listening_score',
            field=models.FloatField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(9)]),
        ),
        migrations.AlterField(
            model_name='ieltsexamsubmission',
            name='overall_score',
            field=models.FloatField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(9)]),
        ),
        migrations.AlterField(
            model_name='ieltsexamsubmission',
            name='reading_score',
            field=models.FloatField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(9)]),
        ),
        migrations.AlterField(
            model_name='ieltsexamsubmission',
            name='speaking_score',
            field=models.FloatField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(9)]),
        ),
        migrations.AlterField(
            model_name='ieltsexamsubmission',
            name='writing_score',
            field=models.FloatField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(9)]),
        ),
        migrations.AlterField(
            model_name='ieltsquestion',
            name='question_type',
            field=models.CharField(choices=[('multiple-choice', 'Multiple Choice'), ('fill-in-the-blank', 'Fill in the Blank'), ('writing', 'Writing'), ('speaking', 'Speaking')], max_length=50),
        ),
    ]
