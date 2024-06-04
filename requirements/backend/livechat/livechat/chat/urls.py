from django.urls import path
from . import views

urlpatterns = [
	path('history/<str:roomId>/', views.ChatHistoryView.as_view())
]
