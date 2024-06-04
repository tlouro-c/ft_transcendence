from .Paddle import Paddle 
from .Ball	import	Ball
from .constantes import CANVAS_WIDTH, PADDLE_WIDTH
import asyncio
from .Hazard import Hazard

class GameLogic:

	def __init__(self, user1, hazard):

		self._score = [0,0]
		self._ball = Ball()
		self._player2_pladdle = Paddle(X=(CANVAS_WIDTH / 2 - PADDLE_WIDTH))
		self._player1_paddle = Paddle(X=(-CANVAS_WIDTH / 2 + PADDLE_WIDTH))
		self.game_paused = 1
		self.user1 = user1
		self._hazard = Hazard(hazard)

	def __del__(self):
		self._score = [0,0]
		del self._ball
		del self._player1_paddle
		del self._player2_pladdle
		del self._score
		del self._hazard
		self.game_paused = 1

	def update_paddles(self, moveUp, moveDown, user):

		player_id = self.get_player_id(user)
		if player_id == 0 and self.game_paused != 1:
			self._player1_paddle.update(moveUp, moveDown)
		elif player_id == 1 and self.game_paused != 1:
			self._player2_pladdle.update(moveUp, moveDown)

	def update_ball(self):
		self._ball.update(self._player1_paddle, self._player2_pladdle, self._score, self.game_paused, self._hazard)

	def update_hazard(self):
		self._hazard.update(self._score[0], self._score[1])

	def get_state(self, user1_id, user2_id):

		if (self.user1 == user1_id):
			response_user1 = user1_id
			response_user2 = user2_id
		else:
			response_user1 = user2_id
			response_user2 = user1_id
		response = {
			"ball_y": self._ball.y,
			"ball_x": self._ball.x,
			"player2_paddle": self._player2_pladdle.y,
			"player1_paddle": self._player1_paddle.y,
			"player2_score": self._score[1],
			"player1_score": self._score[0],
			"player1_id": response_user1,
			"player2_id": response_user2,
			"hazard_y": self._hazard.y
		}
		return response
		
	def	pause(self):
		if self.game_paused == 1:
			self._ball.unpause()
		self.game_paused *= -1
	
	def get_user1(self):
		return self.user1

	def get_player_id(self, user):
		if user == self.user1:
			return 0
		else:
			return 1

	def start_game(self):  # 3 seconds countdown
		self._ball.unpause()
		self.game_paused = -1
