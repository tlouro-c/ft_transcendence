from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Game
from .serializers import GameSerializer
from django.db.models import Q

# Create your views here.

class PendingInvitesView(APIView):
	permission_classes = [IsAuthenticated]
	def get(self, request, userId):
		pending_games = Game.objects.filter(invited=userId, status='Pending')
		return Response(GameSerializer(pending_games, many=True).data, 200)

class GameHistoryView(APIView):
	permission_classes = [IsAuthenticated]
	def get(self, request, userId):	
		games = Game.objects.filter(Q(status='Finished') & (Q(user1=userId) | Q(user2=userId)))
		return Response(GameSerializer(games, many=True).data, 200)
