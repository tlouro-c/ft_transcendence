from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User


class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            return super().get_user(validated_token)
        except AuthenticationFailed as e:
            if e.detail.get('code') == 'user_not_found':
                return User.objects.get(username='GameWorker')
            raise e
