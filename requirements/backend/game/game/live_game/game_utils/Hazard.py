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
		if( self._active):
			self.time_now = int(round(time.time() * 1000))
			if (self.y == -500):
				self.start_hazard(score1, score2)
			else:
				self.check_score(score1, score2)
				self.hazard_move()
			self.last_call = self.time_now

	def start_hazard(self, score1, score2):
		if ((score1 >= 3 or score2 >= 3)):
			self.y =  180

	def hazard_move(self):
		future_y = self.y
		future_y += self.dir * (self.speed * ((self.time_now - self.last_call) / 20))

		if future_y >=  (CANVAS_WIDTH /2) - HAZARDWIDTH / 2 or future_y <= -CANVAS_WIDTH / 2 + HAZARDWIDTH / 2:
			self._correct_position_y()
		else:
			self.y = future_y

	def check_score(self, score1, score2):
		if score1 >= 5 or score2 >= 5:
			self.speed = 5

	def _correct_position_y(self):
		time_divided = ((self.time_now - self.last_call))

		while (time_divided > 0):
			self.y += self.dir * (self.speed / 20)
			time_divided -= 1
			if (self.y >=  (CANVAS_WIDTH /2) - HAZARDWIDTH / 2 or self.y <= -CANVAS_WIDTH / 2 + HAZARDWIDTH / 2):
				if self.y >= CANVAS_WIDTH / 2 - HAZARDWIDTH / 2:
					self.dir = -1
				elif self.y <= -CANVAS_WIDTH / 2 + HAZARDWIDTH / 2:
						self.dir = 1
		self.y += self.dir * (self.speed/20) * time_divided
