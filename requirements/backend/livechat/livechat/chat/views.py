from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.response import Response
from .models import Message
from .serializers import MessageSerializer

# Create your views here.

class ChatHistoryView(APIView):
	permission_classes = [IsAuthenticated]
	def get(self, request, roomId):
		room_messages = Message.objects.filter(roomId=roomId)
		return Response(MessageSerializer(room_messages, many=True).data, 200)
