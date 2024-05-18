from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from .models import User, Friendship, Blocking
from . import serializers
from .utils import user_id_from_token
import datetime


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
			'user_id': user.id,
			'username': user.username,
			'refresh':str(refresh),
			'access':str(refresh.access_token)
		}, 201)


class LogoutView(APIView):
	def post(self, request):
		try:
			refresh_token = request.data['refresh_token']
			refresh_token = RefreshToken(refresh_token)
			refresh_token.blacklist()
			return Response({'Success':'Logged out successfully'}, 205)
		except:
			return Response(400)

class AllUsersView(APIView):
	permission_classes = [IsAuthenticated]
	def get(self, request):
		all_users = User.objects.filter(is_staff=False)
		return Response(serializers.UserSerializer(all_users, many=True).data, 200)

class UserView(APIView):
	permission_classes = [IsAuthenticated]
	def get(self, request, user_id):
		try:
			user = User.objects.get(id=user_id)
		except:
			return Response({'Error': 'User not found'}, 404)
		return Response(serializers.UserSerializer(user).data)
	
	def patch(self, request, user_id):
		try :
			user = User.objects.get(id=user_id)
		except:
			return Response({'Error': 'User not found'}, 404)

		if user.id != user_id_from_token(request):
			return Response({'Error': 'Unauthorized'}, 401)
		serializer = serializers.UserSerializer(instance=user, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data)
		

class SendFriendRequestView(APIView):
	permission_classes = [IsAuthenticated]
	def post(self, request, user_id):
		try:
			sender = User.objects.get(id=user_id_from_token(request))
			receiver = User.objects.get(id=user_id)
		except:
			return Response({'Error': 'User not found'}, 404)
		
		if Friendship.objects.filter((Q(sender=sender) & Q(receiver=receiver)) |
							   Q(sender=receiver) & Q(receiver=sender)).exists():
			return Response({'Error': 'Friend request already sent'}, 400)
		
		new_friendship = Friendship(sender=sender, receiver=receiver, status='Pending')
		new_friendship.save()
		return Response({'Success': 'Friend request sent'}, 201)


class RejectFriendRequestView(APIView):
	permission_classes = [IsAuthenticated]
	def post(self, request, user_id):
		try:
			sender = User.objects.get(id=user_id)
			receiver = User.objects.get(id=user_id_from_token(request))

			friendship = Friendship.objects.get(receiver=receiver, sender=sender)
			friendship.delete()

			return Response({'Success': 'Friend request rejected'}, 201)
		except User.DoesNotExist:
			return Response({'Error': 'User not found'}, 404)
		except Friendship.DoesNotExist:
			return Response({'Error': 'Friend request not found'}, 404)


class AcceptFriendRequestView(APIView):
	permission_classes = [IsAuthenticated]
	def post(self, request, user_id):
		try:
			sender = User.objects.get(id=user_id)
			receiver = User.objects.get(id=user_id_from_token(request))

			friendship = Friendship.objects.get(receiver=receiver, sender=sender)
			friendship.status = 'Friends'
			friendship.friends_since = datetime.datetime.now(datetime.timezone.utc)
			friendship.save()

			return Response({'Success': 'Friend request accepted'}, 201)
		except User.DoesNotExist:
			return Response({'Error': 'User not found'}, 404)
		except Friendship.DoesNotExist:
			return Response({'Error': 'Friend request not found'}, 404)


class RemoveFriendView(APIView):
	permission_classes = [IsAuthenticated]
	def post(self, request, user_id):
		try:
			user = User.objects.get(id=user_id_from_token(request))
			friend = User.objects.get(id=user_id)

			friendship = Friendship.objects.get(Q(receiver=user, sender=friend) | Q(receiver=friend, sender=user))
			friendship.delete()

			return Response({'Success': 'Friend removed'}, 201)
		except User.DoesNotExist:
			return Response({'Error': 'User not found'}, 404)
		except Friendship.DoesNotExist:
			return Response({'Error': 'Friendship not found'}, 404)


class BlockUserView(APIView):
	permission_classes = [IsAuthenticated]
	def post(self, request, user_id):
		try:
			user = User.objects.get(id=user_id_from_token(request))
			to_block = User.objects.get(id=user_id)
		except:
			return Response({'Error': 'User not found'}, 404)
		
		if Blocking.objects.filter(blocker_user=user, blocked_user=to_block).exists():
			return Response({'Error': 'You already blocked this user'}, 400)
		
		new_blocking = Blocking(blocker_user=user, blocked_user=to_block)
		new_blocking.save()
		return Response({'Success': 'User successfully blocked'}, 201)


class UnblockUserView(APIView):
	permission_classes = [IsAuthenticated]
	def post(self, request, user_id):
		try:
			user = User.objects.get(id=user_id_from_token(request))
			blocked_user = User.objects.get(id=user_id)
		except:
			return Response({'Error': 'User not found'}, 404)
		
		try:
			blocking = Blocking.objects.get(blocker_user=user, blocked_user=blocked_user)
			blocking.delete()
			return Response({'Success':'User successfully unblocked'}, 201)
		except:
			return Response({'Error': 'You dont have this user blocked'}, 400)
