from .constantes import	CANVAS_HEIGHT, PADDLE_MAX_SPEED, PADDLE_HEIGHT

class Paddle:

	def __init__(self, X: int):
	
		self.x = X
		self.y = 0
		self.speed = 0


	def update(self, moveUp, moveDown):

		self.speed = self._direction(moveUp, moveDown) * PADDLE_MAX_SPEED
		self.y += self.speed
		if self.y > 175 - PADDLE_HEIGHT /2:
			self.y = 175 - PADDLE_HEIGHT /2
		elif (self.y <= -175 + PADDLE_HEIGHT / 2):
			self.y = -175 + PADDLE_HEIGHT / 2


	def _direction(self, moveUp, moveDown) :

		if moveUp:
			return 1
		if moveDown:
			return -1				
		return 0
