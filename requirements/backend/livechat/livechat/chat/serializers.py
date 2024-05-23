from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
	time = serializers.SerializerMethodField()

	class Meta:
		model = Message
		fields = '__all__'

	def get_time(self, obj):
		time = obj.time.strftime("%H:%M")
		return time
