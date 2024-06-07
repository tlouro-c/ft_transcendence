from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
	path('register/', views.RegisterView.as_view(), name="register"),
	path('login/', views.LoginView.as_view(), name="login"),
	path('logout/', views.LogoutView.as_view(), name="logout"),
	path('users/', views.AllUsersView.as_view(), name="all_users"),
	path('user/<str:user_id>/', views.UserView.as_view(), name="user"),
	path('refresh_token/', TokenRefreshView.as_view(), name='token_refresh'),
	path('block_user/<str:user_id>/', views.BlockUserView.as_view(), name="block_user"),
	path('unblock_user/<str:user_id>/', views.UnblockUserView.as_view(), name="unblock_user"),
	path('send_friend_request/<str:user_id>/', views.SendFriendRequestView.as_view(), name="send_friend_request"),
	path('accept_friend_request/<str:user_id>/', views.AcceptFriendRequestView.as_view(), name="accept_friend_request"),
	path('reject_friend_request/<str:user_id>/', views.RejectFriendRequestView.as_view(), name="reject_friend_request"),
	path('friend_remove/<str:user_id>/', views.RemoveFriendView.as_view(), name="remove_friend"),
]
