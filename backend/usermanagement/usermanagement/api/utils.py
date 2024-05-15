from rest_framework_simplejwt.tokens import AccessToken

def user_id_from_token(request):
	authorization_header = request.headers.get('Authorization')
	if authorization_header:
		token = authorization_header.split()[1]
		token = AccessToken(token)
		user_id = token.payload['user_id']
		return user_id
	else:
		return None

