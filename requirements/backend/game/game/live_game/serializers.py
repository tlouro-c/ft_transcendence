from rest_framework import serializers
from .models import Game


class GameSerializer(serializers.ModelSerializer):
	finish_time = serializers.SerializerMethodField()

	class Meta:
		model = Game
		fields = '__all__'

	def get_finish_time(self, obj):
		finish_time = obj.finish_time.strftime("%H:%M")
		return finish_time
