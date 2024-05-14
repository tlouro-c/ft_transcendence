from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView

urlpatterns = [
	path('register/', views.RegisterView.as_view(), name="register"),
	path('login/', views.LoginView.as_view(), name="login"),
	path('logout/', views.LogoutView.as_view(), name="logout"),
	path('user/<str:username>/', views.UserView.as_view(), name="user"),
	path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#	path('block/<str:blocker_id>/<str:blocked_id>', views.BlockView.as_view(), name="block"),
#	path('unblock/<str:blocker_id>/<str:blocked_id>', views.UnblockView.as_view(), name="block"),
	path('send_friend_request/<str:sender_username>/<str:receiver_username>/', views.SendFriendRequestView.as_view(), name="send_friend_request"),
	path('accept_friend_request/<str:receiver_username>/<str:sender_username>/', views.AcceptFriendRequestView.as_view(), name="accept_friend_request"),
#	path('friend_reject/<str:receiver_id>/<str:sender_id>', views.FriendRejectView.as_view(), name="friend_reject"),
#	path('friend_remove/str:user_id>/<str:friend_id>', views.FriendRemoveView.as_view(), name="friend_remove"),
]
