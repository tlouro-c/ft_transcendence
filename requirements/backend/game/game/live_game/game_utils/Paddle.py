from .constantes import	CANVAS_HEIGHT, PADDLE_MAX_SPEED, PADDLE_HEIGHT

class Paddle:

	def __init__(self, X: int):
	
		self.x = X
		self.y = 250
		self.speed = 0


	def update(self, key):

		self.speed = self._direction(key) * PADDLE_MAX_SPEED
		self.y += self.speed
		if self.y < 0:
			self.y = 0
		elif (self.y > CANVAS_HEIGHT - PADDLE_HEIGHT):
			self.y = CANVAS_HEIGHT - PADDLE_HEIGHT


	def _direction(self, key) :

		if key[0]:
			if key[0] == 'w' or key[0] == 'ArrowUp':
				return -1
			if key[0] == 's' or key[0] == 'ArrowDown':
				return 1
		return 0
