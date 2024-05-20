from django.db import models

# Create your models here.


class Message(models.Model):
	author_id = models.CharField(max_length=10)
	timestamp = models.DateTimeField(auto_now_add=True)
	content = models.TextField()

	def __str__(self):
		return self.content
