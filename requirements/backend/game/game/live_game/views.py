from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.response import Response
from .models import Game
from .serializers import MessageSerializer

# Create your views here.

class ChatHistoryView(APIView):
	permission_classes = [IsAuthenticated]
	def get(self, request, userId):
		game_history = Game.objects.filter(users__contains=[userId])
		return Response(MessageSerializer(game_history, many=True).data, 200)
