from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
	path('user_management/register/', views.RegisterView.as_view(), name="register"),
	path('user_management/login/', views.LoginView.as_view(), name="login"),
	path('user_management/logout/', views.LogoutView.as_view(), name="logout"),
	path('user_management/users/', views.AllUsersView.as_view(), name="all_users"),
	path('user_management/user/<str:user_id>/', views.UserView.as_view(), name="user"),
	path('user_management/refresh_token/', TokenRefreshView.as_view(), name='token_refresh'),
	path('user_management/block_user/<str:user_id>/', views.BlockUserView.as_view(), name="block_user"),
	path('user_management/unblock_user/<str:user_id>/', views.UnblockUserView.as_view(), name="unblock_user"),
	path('user_management/send_friend_request/<str:user_id>/', views.SendFriendRequestView.as_view(), name="send_friend_request"),
	path('user_management/accept_friend_request/<str:user_id>/', views.AcceptFriendRequestView.as_view(), name="accept_friend_request"),
	path('user_management/reject_friend_request/<str:user_id>/', views.RejectFriendRequestView.as_view(), name="reject_friend_request"),
	path('user_management/friend_remove/<str:user_id>/', views.RemoveFriendView.as_view(), name="remove_friend"),
]
