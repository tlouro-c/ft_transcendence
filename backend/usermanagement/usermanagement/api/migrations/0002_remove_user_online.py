# Generated by Django 5.0.6 on 2024-05-14 17:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='online',
        ),
    ]
