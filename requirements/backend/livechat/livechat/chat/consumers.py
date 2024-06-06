import json
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime, timezone
from channels.db import database_sync_to_async
from .models import Message
import logging

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
	group_room_name = ""
	async def connect(self):
		from django.contrib.auth.models import AnonymousUser
		user = self.scope.get('user')
		if user == AnonymousUser():
			await self.close()
			return
		
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.group_room_name = "chat_" + self.room_name

		await self.channel_layer.group_add(
			self.group_room_name,
			self.channel_name
		)
		await self.accept()

	async def disconnect(self, code):
		if self.group_room_name:
			await self.channel_layer.group_discard(
				self.group_room_name,
				self.channel_name
			)

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		message = text_data_json["message"]
		userId = self.scope['user']
		time = datetime.now(timezone.utc).strftime("%H:%M")

		await self.save_message(message, userId)

		await self.channel_layer.group_send(
			self.group_room_name,
			{
				"type": "chat.message",
				"message": message,
				"user": userId,
				"time": time
			}
		)

	async def chat_message(self, event):
		message = event['message']
		time = event['time']
		user = event['user']
		await self.send(text_data=json.dumps({"message": message, "user":user, "time": time}))

	@database_sync_to_async
	def save_message(self, message, senderId):
		new_message = Message.objects.create(roomId=self.room_name, content=message, senderId=senderId)
		new_message.save()
