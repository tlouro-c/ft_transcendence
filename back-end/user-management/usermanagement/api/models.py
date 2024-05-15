from django.db import models
from django.db.models import Q
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
	username = models.CharField(max_length=128, unique=True)
	password = models.CharField(max_length=128)
	avatar = models.ImageField(upload_to='avatars/', default='avatars/default.jpg')
	in_game = models.BooleanField(default=False)

	USERNAME_FIELD = 'username'
	REQUIRED_FIELDS = []

	def __str__(self):
		return self.username
	
	def friends(self):
		return Friendship.friends(self)
	
	def pending_friends(self):
		return Friendship.pending_friends(self)
	
	def blocked_by(self):
		return Blocking.blocked_by(self)
	
	def blocked(self):
		return Blocking.blocked(self)
	
	
	#def pending_friends(self):

class Friendship(models.Model):
	STATUS = (
		('Pending', 'Pending'),
		('Friends', 'Friends')
	)

	status = models.CharField(max_length=10, choices=STATUS, default='Pending')
	sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
	receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver')
	friends_since = models.DateTimeField(null=True)

	def __str__(self):
		return f'{self.sender} | {self.receiver}: {self.status}'
	
	@staticmethod
	def friends(user):
		friendships = Friendship.objects.filter((Q(sender=user) | Q(receiver=user)) & Q(status='Friends'))
		friends = []
		for friendship in friendships:
			friend = {}
			if friendship.sender == user:
				friend['username'] = friendship.receiver.username
				friend['since'] = friendship.friends_since.strftime('%Y-%m-%d %H:%M')
			else:
				friend['username'] = friendship.sender.username
				friend['since'] = friendship.friends_since.strftime('%Y-%m-%d %H:%M')
			friends.append(friend)
		return friends
	
	@staticmethod
	def pending_friends(user):
		friendships = Friendship.objects.filter(Q(receiver=user) & Q(status='Pending'))
		pending_friends = []
		for friendship in friendships:
			pending_friends.append(friendship.sender.username)
		return pending_friends


class Blocking(models.Model):
	blocker_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocker_user', null=True)
	blocked_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_user', null=True)

	def __str__(self):
		return f'{self.blocker_user} blocked {self.blocked_user}'

	@staticmethod
	def blocked_by(user):
		blockings = Blocking.objects.filter(blocked_user=user)
		blocked_by = []
		for blocking in blockings:
			blocked_by.append(blocking.blocker_user.username)
		return blocked_by
	
	@staticmethod
	def blocked(user):
		blockings = Blocking.objects.filter(blocker_user=user)
		blocked = []
		for blocking in blockings:
			blocked.append(blocking.blocked_user.username)
		return blocked

