from django.db import models
from django.db.models import Q
from django.contrib.auth.models import AbstractUser
from datetime import datetime, timezone, timedelta

# Create your models here.

class User(AbstractUser):
	username = models.CharField(max_length=128, unique=True)
	password = models.CharField(max_length=128)
	avatar = models.ImageField(upload_to='avatars/', default='avatars/default.jpg')
	in_game = models.BooleanField(default=False)
	last_action = models.DateTimeField(auto_now=True)

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
	
	def online_status(self):
		time_since_last_action = datetime.now(timezone.utc) - self.last_action
		timer = timedelta(minutes=5)
		if timer > time_since_last_action:
			return "online"
		return "offline"
	
	
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
				friend['online_status'] = friendship.receiver.online_status()
				friend['avatar'] = friendship.receiver.avatar.url
				friend['id'] = friendship.receiver.id
				friend['username'] = friendship.receiver.username
				friend['since'] = friendship.friends_since.strftime('%Y-%m-%d %H:%M')
			else:
				friend['online_status'] = friendship.sender.online_status()
				friend['avatar'] = friendship.sender.avatar.url
				friend['id'] = friendship.sender.id
				friend['username'] = friendship.sender.username
				friend['since'] = friendship.friends_since.strftime('%Y-%m-%d %H:%M')
			friends.append(friend)
		return friends
	
	@staticmethod
	def pending_friends(user):
		friendships = Friendship.objects.filter(Q(receiver=user) & Q(status='Pending'))
		pending_friends = []
		for friendship in friendships:
			pending_friend = {'avatar':friendship.sender.avatar.url, 'id':friendship.sender.id, 'username':friendship.sender.username}
			pending_friends.append(pending_friend)
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

