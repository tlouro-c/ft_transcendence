from .constantes import	CANVAS_HEIGHT, PADDLE_MAX_SPEED, PADDLE_HEIGHT

class Paddle:

	def __init__(self, X: int):
	
		self.x = X
		self.y = 0
		self.speed = 0


	def update(self, key):

		self.speed = self._direction(key) * PADDLE_MAX_SPEED
		self.y += self.speed
		if self.y < 175 - PADDLE_HEIGHT /2:
			self.y = 175 - PADDLE_HEIGHT /2
		elif (self.y >= 175 - PADDLE_HEIGHT):
			self.y = 175 - PADDLE_HEIGHT


	def _direction(self, key) :

		if key[0]:
			if key[0] == 'a':
				return -1
			if key[0] == 'd':
				return 1
		return 0
