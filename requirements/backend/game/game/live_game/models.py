from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class Game(models.Model):
	users = ArrayField(models.CharField(max_length=100), )
	winner = models.CharField(max_length=100)
	result = models.CharField(max_length=100)
	finish_time = models.DateTimeField(auto_now_add=True)


class GameRoom(models.Model):

