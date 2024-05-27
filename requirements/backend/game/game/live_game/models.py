from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.

# class Tournament(models.Model):
# 	users = ArrayField(models.CharField(max_length=100), size=4)

class Game(models.Model):

	STATUS = (
		('Pending', 'Pending'),
		('On Going', 'On Going'),
		('Finished', 'Finished')
	)

	user1 = models.CharField(max_length=100)
	user1_score = models.IntegerField(default=0)
	user2 = models.CharField(max_length=100)
	user2_score = models.IntegerField(default=0)
	invited = models.CharField(max_length=100, null=True, blank=True)
	invited_by = models.CharField(max_length=100, null=True, blank=True)
	# mode_3d = models.BooleanField(default=False)
	# mode_hazard = models.BooleanField(default=False)
	# tournament = models.ForeignKey(Tournament, null=True, blank=True)
	status = models.CharField(max_length=10, choices=STATUS, default='Pending')
	winner = models.CharField(max_length=100, null=True, blank=True)
	finish_time = models.DateTimeField(null=True, blank=True)

