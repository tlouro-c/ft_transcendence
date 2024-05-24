from channels.middleware import BaseMiddleware
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
import httpx
from rest_framework_simplejwt.tokens import AccessToken
from urllib.parse import parse_qs
from time import sleep
import logging

logger = logging.getLogger(__name__)

def user_id_from_token(token):
	try:
		token = AccessToken(token, False)
		user_id = token.payload['user_id']
		return user_id
	except:
		return -5


class JwtAuthMiddleware(BaseMiddleware):


	async def __call__(self, scope, receive, send):
		query_string = parse_qs(scope["query_string"].decode())
		token = query_string.get('token', [None])[0] or None
		
		user_id = user_id_from_token(token)

		try:
			request_headers = {'Authorization': f'Bearer {token}'}
			async with httpx.AsyncClient() as client:
				response = await client.get(f'http://user-management-service:8000/user_management/user/{user_id}/', headers=request_headers)
			if response.status_code != 200:
				raise "Unauthenticated"

			user_data = response.json()
			logger.debug(user_data)
			scope['user'] = user_data.get('id', AnonymousUser())
		except:
			scope['user'] = AnonymousUser()
	
		return await super().__call__(scope, receive, send)
