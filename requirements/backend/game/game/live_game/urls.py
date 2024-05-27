from django.urls import path
from . import views

urlpatterns = [
	path('history/<str:userId>/', views.GameHistoryView.as_view()),
	path('pending/<str:userId>/', views.PendingInvitesView.as_view())
]
