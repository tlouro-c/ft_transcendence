import random
import time
from .constantes import CANVAS_HEIGHT, CANVAS_WIDTH, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_MAX_SPEED, BALL_RADIUS, BALL_START_SPEED, HAZARDDEPTH, HAZARDHEIGHT, HAZARDWIDTH

class Ball:

	def __init__(self):

		self.x = 1
		self.y = 1
		self.x_dir = 1
		self.y_dir = self.random_start_pos()
		self.speed = 4
		self.last_call = int(round(time.time() * 1000))
		self.last_col = int(round(time.time() * 1000))

	def __del__(self):
		self.x = 1
		self.y = 1
		self.x_dir = 1
		self.y_dir = self.random_start_pos()
		self.speed = 4
		self.last_call = int(round(time.time() * 1000))
		self.last_col = int(round(time.time() * 1000))


	def update(self, Left_paddle, Right_paddle, score: int, game_paused: int, hazard):

		self.left_paddle = Left_paddle
		self.right_paddle = Right_paddle
		self.hazard = hazard
		self.time_now = int(round(time.time() * 1000))

		if game_paused == -1:
			self._check_paddle_collision()
			self._check_border_collision(score)
			self._calculate_position(score)
			if self.hazard._active:
				self._check_hazard_collision()

		self.last_call = self.time_now

	def unpause(self):
		self.time_now = int(round(time.time() * 1000))
		self.last_call = self.time_now
		self.last_col = self.time_now

	def _check_paddle_collision(self):

		flag = 0
		if self.time_now - self.last_col > 100:
			if (self.x <= self.left_paddle.x + PADDLE_WIDTH and
				self.x >= self.left_paddle.x):
				if (self.y <= self.left_paddle.y + PADDLE_HEIGHT / 2 and
				self.y >= self.left_paddle.y - PADDLE_HEIGHT / 2):
					if (self.x_dir < 0):
						target_paddle = self.left_paddle
						flag = 1
						self.last_col = self.time_now
	
			if (self.x <= self.right_paddle.x + PADDLE_WIDTH and
				self.x >= self.right_paddle.x - 15):
				if (self.y <= self.right_paddle.y + PADDLE_HEIGHT / 2 and
				self.y >= self.right_paddle.y - PADDLE_HEIGHT / 2):
					if self.x_dir > 0:
						target_paddle = self.right_paddle
						flag = 1
						self.last_col = self.time_now
	
	
			if (flag == 1):
				self.x_dir *= -1
				if self.y >= target_paddle.y:
					self.y_dir = random.uniform(0.01,1)
				elif self.y < target_paddle.y:
					self.y_dir = random.uniform(-0.01, -1)
				if self.speed < BALL_MAX_SPEED:
					self.speed += 1
				flag = 0


	def _check_border_collision(self, score):

		if ((self.x + self.x_dir <= (-CANVAS_WIDTH / 2)) or (self.x + self.x_dir  >= (CANVAS_WIDTH / 2))):
			if self.x + self.x_dir - BALL_RADIUS <= (-CANVAS_WIDTH / 2):
				score[1] +=1
				self.x = -10
				self.y = -10
			if self.x + self.x_dir + BALL_RADIUS >= (CANVAS_WIDTH / 2):
				score[0] +=1
				self.x = 10
				self.y = 10
			self.x_dir *= -1

			self.speed = BALL_START_SPEED
		if ((self.y + self.y_dir + BALL_RADIUS) >= (CANVAS_HEIGHT / 2) or (self.y + self.y_dir - BALL_RADIUS) <= (-CANVAS_HEIGHT / 2)):
			self.y_dir *= -1


	def _calculate_position(self, score):

		future_x = self.x
		future_y = self.y
		future_x += self.x_dir * (self.speed * ((self.time_now - self.last_call) / 20))
		future_y += self.y_dir * (self.speed * ((self.time_now - self.last_call) / 20))

		if future_y >=  (CANVAS_HEIGHT /2) or future_y <= (-CANVAS_HEIGHT /2) :
			self._correct_position_y()
		else:
			self.y = future_y
		if (self.x > 0 and future_x < 0) or (self.x < 0 and future_x > 0):
			self._correct_position_for_hazard()
		if future_x >= 290 or future_x <= -290:
			self._correct_position_x(score)
		else:
			self.x = future_x


	def _correct_position_y(self):

		time_divided = ((self.time_now - self.last_call))

		while (time_divided > 0):
			self.y += self.y_dir * (self.speed / 20)
			time_divided -= 1
			if (self.y > (CANVAS_HEIGHT /2) or self.y < (-CANVAS_HEIGHT /2)):
				self.y_dir *= -1
				break
		self.y += self.y_dir * (self.speed/20) * time_divided
	

	def _correct_position_x(self, score):

		time_divided = ((self.time_now - self.last_call))

		while (time_divided > 0):
			self.x += self.x_dir * (self.speed / 20)
			time_divided -= 1
			if (self.x <= -290 or self.x >= 290):
				self._check_paddle_collision()
				break
		self.x += self.x_dir * (self.speed/20) * time_divided
		self._check_border_collision(score)
	
	def random_start_pos(self):
		return random.uniform(-1,1)
		
	def _correct_position_for_hazard(self):
		time_divided = ((self.time_now - self.last_call))

		while (time_divided > 0):
			previous_x = self.x
			self.x += self.x_dir * (self.speed / 20)
			time_divided -= 1
			if (self.x > 0 and previous_x < 0) or (self.x < 0 and previous_x > 0):
				self._check_hazard_collision()
				break
		self.x += self.x_dir * (self.speed/20) * time_divided

	def _check_hazard_collision(self):

		if self.time_now - self.last_col > 100:
			if (self.x <= self.hazard.x + HAZARDWIDTH / 2 and
				self.x >= self.hazard.x - HAZARDWIDTH / 2):
				if (self.y <= self.hazard.y + HAZARDHEIGHT / 2 and
				self.y >= self.hazard.y - HAZARDHEIGHT / 2): 
					self.x_dir = -self.x_dir
					self.last_col = self.time_now
			
		
