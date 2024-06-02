import json
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime, timezone
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from .models import Game
import logging
from random import choice, shuffle

##Vera
import asyncio
from asgiref.sync import sync_to_async
from .game_utils.GameLogic import GameLogic
##


logger = logging.getLogger(__name__)

class GameConsumer(AsyncWebsocketConsumer):

	users_in_room = {}
	room_db_entry = {}
	game_map = {}

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
		if self.room_id not in self.game_map:
			self.game_map[self.room_id] = GameLogic(self.scope.get('user'), self.scope.get('hazard'))
		self.users_in_room[self.room_id].add(user)

		self.user_count = len(self.users_in_room[self.room_id])
		if self.user_count <= 1:
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
					"ball_owner": choice(list(self.users_in_room[self.room_id])),
					"user_1": list(self.users_in_room[self.room_id])[0],
					"user_2": list(self.users_in_room[self.room_id])[1]
				})

	async def disconnect(self, code):
		user = self.scope.get('user')

		self.users_in_room[self.room_id].remove(user)
		await self.channel_layer.group_discard(
			self.group_room_name,
			self.channel_name
		)

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
			del self.game_map[self.room_id]


	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		type_of_event = text_data_json["type"]

		if type_of_event == "ball":
			await self.channel_layer.group_send(
				self.group_room_name,
				{
					"type": "ball_updates",
					"data": text_data_json
				}
			)
		if type_of_event == "StartGame":
			self.game_map[self.room_id].start_game()
			

	async def action(self, event):
		type_of_event = event['type']
		action = event['action']
		user = event['user']
		await self.send(text_data=json.dumps({'type':type_of_event, 'action':action, 'user':user}))

	async def info(self, event):
		type_of_event = event['type']
		info = event['info']
		if 'ball_owner' in event:
			ball_owner = event['ball_owner']
			user_1 = event['user_1']
			user_2 = event['user_2']
			await self.send(text_data=json.dumps({'type':type_of_event, "info": info, "ball_owner": ball_owner, "user_1":user_1, "user_2":user_2}))
		else:
			await self.send(text_data=json.dumps({'type':type_of_event, "info": info}))

	async def point(self, event):
		type_of_event = event['type']
		point_winner = event['point_winner']
		await self.send(text_data=json.dumps({'type':type_of_event, "point_winner":point_winner}))

	async def win(self, event):
		type_of_event = event['type']
		match_winner = event['winner']
		await self.send(text_data=json.dumps({'type':type_of_event, "winner":match_winner}))

	# @database_sync_to_async
	# def new_game_on_db(self):
	# 	user = self.scope.get('user')
	# 	invited = str(int(self.room_id) - int(user))
	# 	mode_hazard = self.scope.get('mode_hazard') == 'true'

	# 	new_game = Game(user1=user, user2=invited, invited=invited, invited_by=user, mode_hazard=mode_hazard)
	# 	new_game.save()
	# 	return new_game.id

	@database_sync_to_async
	def new_game_on_db(self):
		user1 = self.scope.get('user')
		invited = self.scope.get('invited')
		mode_hazard = self.scope.get('mode_hazard')
		tournament = self.scope.get('tournament')

		if tournament:
			new_game = Game(user1=user1, mode_hazard=mode_hazard)
		else:
			new_game = Game(user1=user1, invited=invited, invited_by=user1, mode_hazard=mode_hazard)
		new_game.save()
		return new_game.id

	# @database_sync_to_async
	# def start_game_on_db(self):
	# 	game = Game.objects.get(id=self.room_db_entry[self.room_id])
	# 	game.status = 'On Going'
	# 	game.save()

	@database_sync_to_async
	def start_game_on_db(self):
		user2 = self.scope.get('user')
		game = Game.objects.get(id=self.room_db_entry[self.room_id])
		game.user2 = user2
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
	def update_result(self, game_state):
		game = Game.objects.get(id=self.room_db_entry[self.room_id])
		if game_state["player1_score"] != game.user1_score:
			game.user1_score = game_state["player1_score"]
		if game_state["player2_score"] != game.user2_score:
			game.user2_score = game_state["player2_score"]
		game.save()
		if game_state["player1_score"] == 7:
			return game.user1
		elif game_state["player2_score"] == 7:
			return game.user2
		else:
			return None
		
	@database_sync_to_async
	def get_player_id(self, user):
		game = Game.objects.get(id=self.room_db_entry[self.room_id])
		if game.user1 == user:
			return 0
		else:
			return 1



#VERA WAS HERE

	async def ball_updates(self, event):

		game_id = self.room_id
		if self.game_map[game_id]:

			data = event['data']
			temp_data = self.game_map[game_id].get_state(list(self.users_in_room[self.room_id])[0], list(self.users_in_room[self.room_id])[1])

			if ((data.get("moveUp") or data.get("moveDown")) and data.get("user_id") == self.scope.get('user')):
				self.game_map[game_id].update_paddles(data.get("moveUp"), data.get("moveDown"), data.get("user_id"))

			self.game_map[game_id].update_ball()

			response_data = self.game_map[game_id].get_state(list(self.users_in_room[self.room_id])[0], list(self.users_in_room[self.room_id])[1])

			# logger.debug(response_data)

			await self.send(text_data=json.dumps({
				'type': 'ball_updates',
				'data': response_data,
			}))

			if temp_data["player1_score"] != response_data["player1_score"] or temp_data["player2_score"] != response_data["player2_score"]:
				match_winner = await self.update_result(response_data)
				if match_winner is not None:
					await self.finish_game(match_winner)
					await self.channel_layer.group_send(self.group_room_name,
					{
						"type": "win",
						"winner": match_winner
					})
## No more Vera


class TournamentConsumer(AsyncWebsocketConsumer):

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
		if self.user_count < 4:
			self.room_db_entry[self.room_id] = await self.new_game_on_db()
			await self.channel_layer.group_send(self.group_room_name,
			{
				"type": "info",
				"info": f'Wait, you need {4 - self.user_count} more {"player" if self.user_count == 3 else "players"}',
			})
		else:
			randomized_participants = shuffle(list(self.users_in_room[self.room_id]))
			await self.start_game_on_db()
			await self.channel_layer.group_send(self.group_room_name,
				{
					"type": "info",
					"info": "The tournament will start",
					"game_1_user_1": randomized_participants[0],
					"game_1_user_1": randomized_participants[1],
					"game_2_user_2": randomized_participants[2],
					"game_2_user_2": randomized_participants[3]
				})


