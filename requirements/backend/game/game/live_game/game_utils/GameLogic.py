from .Paddle import Paddle 
from .Ball	import	Ball
from .constantes import CANVAS_WIDTH, PADDLE_WIDTH
import asyncio

class GameLogic:

	def __init__(self):

		self._score = [0,0]
		self._ball = Ball()
		self._right_Paddle = Paddle(X=(CANVAS_WIDTH / 2 - PADDLE_WIDTH))
		self._left_Paddle = Paddle(X=(-CANVAS_WIDTH / 2 + PADDLE_WIDTH))
		self.game_paused = -1

	def update_paddles(self, key: str, player_id: int):

		if player_id == 0 and self.game_paused != 1:
			self._left_Paddle.update(key)
		elif player_id == 1 and self.game_paused != 1:
			self._right_Paddle.update(key)

	def update_ball(self):
		self._ball.update(self._left_Paddle, self._right_Paddle, self._score, self.game_paused)

	def get_state(self):

		response = {
			"ball_y": self._ball.y,
			"ball_x": self._ball.x,
			"right_coords": self._right_Paddle.y,
			"left_coords": self._left_Paddle.y,
			"player2_score": self._score[1],
			"player1_score": self._score[0],
		}
		return response
		
	def	pause(self):
		if self.game_paused == 1:
			self._ball.unpause()
		self.game_paused *= -1

	def start_game(self):
		asyncio.sleep(3)  # 3 seconds countdown
		self.pause()