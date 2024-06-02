from .constantes import	CANVAS_HEIGHT, PADDLE_MAX_SPEED, PADDLE_HEIGHT
import time

class Paddle:

	def __init__(self, X: int):
	
		self.x = X
		self.y = 0
		self.speed = 0
		self.move_up = 0
		self.move_down = 0
		self.last_call = int(round(time.time() * 1000))

	def __del__(self):
		self.x = 0
		self.y = 0
		self.speed = 0

	def update(self, moveUp, moveDown):

		self.time_now = int(round(time.time() * 1000))
		if (moveUp):
			if self.move_up == 0:
				self.last_call = int(round(time.time() * 1000))
				self.move_up = 1
		else:
			self.move_up = 0
		if (moveDown):
			if self.move_down == 0:
				self.move_down = 1
				self.last_call = int(round(time.time() * 1000))
		else:
			self.move_down = 0

		future_y = self.y
		future_y += self._direction(moveUp, moveDown) * (PADDLE_MAX_SPEED * ((self.time_now - self.last_call) / 20))
		if future_y > 175 - PADDLE_HEIGHT /2:
			self.y = 175 - PADDLE_HEIGHT /2
		elif (future_y <= -175 + PADDLE_HEIGHT / 2):
			self.y = -175 + PADDLE_HEIGHT / 2
		else:
			self.y = future_y
		self.last_call = self.time_now

	def _direction(self, moveUp, moveDown) :

		if moveUp:
			return 1
		if moveDown:
			return -1				
		return 0
