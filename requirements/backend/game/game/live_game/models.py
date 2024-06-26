from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class Tournament(models.Model):
	users = ArrayField(models.CharField(max_length=100), size=4)
	semi_final_1_winner = models.CharField(max_length=100, blank=True, null=True)
	semi_final_2_winner = models.CharField(max_length=100, blank=True, null=True)
	final_winner = models.CharField(max_length=100, blank=True, null=True)

class Game(models.Model):

	STATUS = (
		('Pending', 'Pending'),
		('On Going', 'On Going'),
		('Finished', 'Finished')
	)

	user1 = models.CharField(max_length=100)
	user1_score = models.IntegerField(default=0)
	user2 = models.CharField(max_length=100, null=True, blank=True)
	user2_score = models.IntegerField(default=0)
	invited = models.CharField(max_length=100, null=True, blank=True)
	invited_by = models.CharField(max_length=100, null=True, blank=True)
	mode_hazard = models.BooleanField(default=False)
	#tournament = models.ForeignKey(Tournament, null=True, blank=True)
	status = models.CharField(max_length=10, choices=STATUS, default='Pending')
	winner = models.CharField(max_length=100, null=True, blank=True)
	finish_time = models.DateTimeField(null=True, blank=True)
		
	def __str__(self):
		return f"Game: {self.id} | user1: {self.user1}:{self.user1_score} | user2: {self.user2}:{self.user2_score} | status: {self.status}"
