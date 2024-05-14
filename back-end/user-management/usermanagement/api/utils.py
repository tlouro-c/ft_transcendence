from rest_framework_simplejwt.tokens import AccessToken

def user_id_from_token(request):
	authorization_header = request.data['Authorization']
	token = authorization_header.split()[1]
	token = AccessToken(token)
	user_id = token.payload['user_id']
	return user_id

