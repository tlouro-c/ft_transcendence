# Generated by Django 5.0.6 on 2024-05-14 21:53

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_remove_user_online'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='blocking',
            name='blocked',
        ),
        migrations.RemoveField(
            model_name='blocking',
            name='blocker',
        ),
        migrations.RemoveField(
            model_name='friendship',
            name='user_one',
        ),
        migrations.RemoveField(
            model_name='friendship',
            name='user_two',
        ),
        migrations.AddField(
            model_name='blocking',
            name='blocked_user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='blocked_user', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='blocking',
            name='blocker_user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='blocker_user', to=settings.AUTH_USER_MODEL),
        ),
    ]
