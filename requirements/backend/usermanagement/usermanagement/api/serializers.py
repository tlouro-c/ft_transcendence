from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from . import models

class FriendshipSerializer(serializers.ModelSerializer):
	sender = serializers.StringRelatedField()
	receiver = serializers.StringRelatedField()

	class Meta:
		model = models.Friendship
		fields = '__all__'


class BlockingSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Blocking
		fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
	friends = serializers.SerializerMethodField()
	pending_friends = serializers.SerializerMethodField()
	blocked = serializers.SerializerMethodField()
	blocked_by = serializers.SerializerMethodField()
	online_status = serializers.SerializerMethodField()

	class Meta:
		model = models.User
		fields = ['id', 'username', 'password', 'avatar', 'in_game',
			 'friends', 'pending_friends', 'blocked', 'blocked_by', 'online_status']
		extra_kwargs = {
			'password': {'write_only': True}
		}

	def get_online_status(self, obj):
		try:
			return obj.online_status()
		except Exception as e:
			print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
			return str(e)

	def get_friends(self, obj):
		return obj.friends()
	
	def get_pending_friends(self, obj):
		return obj.pending_friends()
	
	def get_blocked_by(self, obj):
		return obj.blocked_by()
	
	def get_blocked(self, obj):
		return obj.blocked()
	

	def create(self, validated_data):
		password = validated_data.pop('password', None)
		user_instance = self.Meta.model(**validated_data)
		if password is not None:
			try:
				validate_password(password, user=user_instance)
			except ValidationError as e:
				raise serializers.ValidationError({'password': e.messages})
			user_instance.set_password(password)
		user_instance.save()
		return user_instance

	def update(self, instance, validated_data):
		instance.username = validated_data.get('username', instance.username)
		instance.avatar = validated_data.get('avatar', instance.avatar)
		
		password = validated_data.get('password', None)
		if password is not None:
			try:
				validate_password(password, user=instance)
			except ValidationError as e:
				raise serializers.ValidationError({'password': e.messages})
			instance.set_password(password)

		instance.save()
		return instance
