import json
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime, timezone
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from .models import Game
import logging

logger = logging.getLogger(__name__)

class GameConsumer(AsyncWebsocketConsumer):

	users_in_room = {}
	room_db_entry = {}

	async def connect(self):

		self.room_id = self.scope['url_route']['kwargs']['room_id']
		self.group_room_name = "chat_" + self.room_id

		user = self.scope.get('user')
		if user == AnonymousUser():
			await self.close()
			return
		

		await self.channel_layer.group_add(
			self.group_room_name,
			self.channel_name
		)
		await self.accept()


		if self.room_id not in self.users_in_room:
			self.users_in_room[self.room_id] = set()
		if self.room_id not in self.room_db_entry:
			self.room_db_entry[self.room_id] = int()
		self.users_in_room[self.room_id].add(user)


		self.user_count = len(self.users_in_room[self.room_id])
		if self.user_count == 1:
			self.room_db_entry[self.room_id] = await self.new_game_on_db()
			await self.channel_layer.group_send(self.group_room_name,
			{
				"type": "info",
				"info": "Wait",
			});
		else:
			await self.start_game_on_db();
			await self.channel_layer.group_send(self.group_room_name,
				{
					"type": "info",
					"info": "Start",
				});


	async def disconnect(self, code):
		user = self.scope.get('user')

		logger.debug(self.users_in_room[self.room_id])

		self.users_in_room[self.room_id].remove(user)
		await self.channel_layer.group_discard(
			self.group_room_name,
			self.channel_name
		)

		logger.debug(len(self.users_in_room[self.room_id]))

		users_counter = len(self.users_in_room[self.room_id])

		if users_counter == 1:
			remaining_user = list(self.users_in_room[self.room_id])[0]
			await self.finish_game(remaining_user)
			await self.channel_layer.group_send(self.group_room_name,
			{
				"type": "win",
				"winner": remaining_user
			});
		elif users_counter < 1:
			await self.clear_if_invalid_game()
			del self.users_in_room[self.room_id]
			del self.room_db_entry[self.room_id]


	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		type_of_event = text_data_json["type"]
		user = self.scope["user"]

		if type_of_event == "point":
			point_winner = text_data_json["point_winner"]
			await self.channel_layer.group_send(self.group_room_name,
			{
				"type": "point",
				"point_winner": point_winner
			});
			logger.debug("Point winner -> " + str(point_winner))
			match_winner = await self.update_result(str(point_winner))
			if match_winner is not None:
				await self.finish_game(match_winner)
				await self.channel_layer.group_send(self.group_room_name,
				{
					"type": "win",
					"winner": match_winner
				});
			


	async def action(self, event):
		type_of_event = event['type']
		action = event['action']
		user = event['user']
		await self.send(text_data=json.dumps({'type':type_of_event, 'action':action, 'user':user}))

	async def info(self, event):
		type_of_event = event['type']
		info = event['info']
		await self.send(text_data=json.dumps({'type':type_of_event, "info": info}))

	async def point(self, event):
		type_of_event = event['type']
		point_winner = event['point_winner']
		await self.send(text_data=json.dumps({'type':type_of_event, "point_winner":point_winner}))

	async def win(self, event):
		type_of_event = event['type']
		match_winner = event['winner']
		await self.send(text_data=json.dumps({'type':type_of_event, "winner":match_winner}))

	@database_sync_to_async
	def new_game_on_db(self):
		user = self.scope.get('user')
		invited = str(int(self.room_id) - int(user))

		new_game = Game(user1=user, user2=invited, invited=invited, invited_by=user)
		new_game.save()
		return new_game.id

	@database_sync_to_async
	def start_game_on_db(self):
		game = Game.objects.get(id=self.room_db_entry[self.room_id])
		game.status = 'On Going'
		game.save()

	@database_sync_to_async
	def finish_game(self, winner):
		game = Game.objects.get(id=self.room_db_entry[self.room_id])

		if game.status == 'On Going':
			game.status = 'Finished'
			game.winner = winner
			game.finish_time = datetime.now(timezone.utc)
			game.save()

	@database_sync_to_async
	def clear_if_invalid_game(self):
		game = Game.objects.get(id=self.room_db_entry[self.room_id])
		if game.status == 'Pending':
			game.delete()

	@database_sync_to_async
	def update_result(self, point_winner):
		game = Game.objects.get(id=self.room_db_entry[self.room_id])
		if point_winner == game.user1:
			game.user1_score += 1
		else:
			game.user2_score += 1
		game.save()
		if game.user1_score == 7 or game.user2_score == 7:
			return point_winner
		else:
			return None