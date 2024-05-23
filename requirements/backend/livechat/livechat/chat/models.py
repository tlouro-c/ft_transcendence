from django.db import models

# Create your models here.

class Message(models.Model):
	roomId = models.CharField(max_length=10)
	senderId = models.CharField(max_length=10)
	content = models.TextField()
	time = models.DateTimeField(auto_now_add=True)
