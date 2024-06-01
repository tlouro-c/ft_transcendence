from .constantes import	CANVAS_WIDTH, HAZARDWIDTH, HAZARDHEIGHT, HAZARDDEPTH
import time

class Hazard:

	def __init__(self, active):
	
		self.x = 0
		self.y = -500
		self.speed = 3
		self.dir = 1
		self.last_call = int(round(time.time() * 1000))
		self._active = active


	def update(self, score1, score2):
		if (self._active is False):
			self.start_hazard(score1, score2)
		else:
			self.hazard_move()

	def start_hazard(self, score1, score2):
		if ((score1 >= 3 or score2 >= 3)):
			self.y =  180
			self._active is True

	def hazard_move(self):
		if self.y >= CANVAS_WIDTH / 2 - HAZARDWIDTH / 2:
				self.hazardDir = -1
		elif self.y <= -CANVAS_WIDTH / 2 + HAZARDWIDTH / 2:
					self.hazardDir = 1
		self.y += self.speed * self.dir

	def check_score(self, score1, score2):
		if score1 >= 5 or score2 >= 5:
			self.speed = 5
