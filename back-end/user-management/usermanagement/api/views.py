from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from .models import User, Friendship
from . import serializers
from .utils import user_id_from_token


class RegisterView(APIView):
	def post(self, request):
		new_user = serializers.UserSerializer(data=request.data)
		new_user.is_valid(raise_exception=True)
		new_user.save()
		return Response(new_user.data)
	

class LoginView(APIView):
	def post(self, request):
		username = request.data.get('username')
		password = request.data.get('password')

		try:
			user = User.objects.get(username=username)
		except:
			raise AuthenticationFailed("User not found")
		
		if not user.check_password(password):
			raise AuthenticationFailed("Wrong password")
		
		refresh = RefreshToken.for_user(user)

		return Response({
			'username': username,
			'refresh':str(refresh),
			'access':str(refresh.access_token)
		}, 201)


class LogoutView(APIView):
	permission_classes = [IsAuthenticated]
	def post(self, request):
		try:
			refresh_token = request.data['refresh_token']
			refresh_token = RefreshToken(refresh_token)
			refresh_token.blacklist()
			return Response({'Success':'Logged out successfully'}, 205)
		except:
			return Response(400)


class UserView(APIView):
	permission_classes = [IsAuthenticated]
	def get(self, request, username):
		try:
			user = User.objects.get(username=username)
		except:
			return Response({'Error': 'User not found'}, 404)
		return Response(serializers.UserSerializer(user).data)
	
	def patch(self, request, username):
		try :
			user = User.objects.get(username=username)
		except:
			return Response({'Error': 'User not found'}, 404)

		if user.id != user_id_from_token(Response):
			return Response({'Error': 'Unauthorized'}, 401)
		serializer = serializers.UserSerializer(instance=user, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data)
		

class SendFriendRequestView(APIView):
	def post(self, request, sender_username, receiver_username):
		try:
			sender = User.objects.get(username=sender_username)
			receiver = User.objects.get(username=receiver_username)
		except:
			return Response({'Error': 'User not found'}, 404)
		
		if sender.id != user_id_from_token(request):
			return Response({'Error': 'Unauthorized'}, 401)
		
		if Friendship.objects.filter((Q(sender=sender) & Q(receiver=receiver)) |
							   Q(sender=receiver) & Q(receiver=sender)).exists():
			return Response({'Error': 'Friend request already sent'}, 400)
		
		new_friendship = Friendship(sender=sender, receiver=receiver, status='Pending')
		new_friendship.save()
		return Response({'Success': 'Friend request sent'}, 201)


class AcceptFriendRequestView(APIView):
	def post(self, request, receiver_username, sender_username):
		try:
			sender = User.objects.get(username=sender_username)
			receiver = User.objects.get(username=receiver_username)
		except:
			return Response({'Error': 'User not found'}, 404)
		
		#if receiver.id != user_id_from_token(request):
		#	return Response({'Error': 'Unauthorized'}, 401)
		
		try:
			friendship = Friendship.objects.get(receiver=receiver, sender=sender)
			friendship.status = 'Friends'
			friendship.save()
			return Response({'Success': 'Friend request accepted'}, 201)
		except:
			return Response({'Error': 'Friend request not found'}, 404)
