"""
ASGI config for livechat project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'livechat.settings')

django.setup()

from chat.routing import websocket_urlpatterns
from .middleware import JwtAuthMiddleware

application = ProtocolTypeRouter(
	{
		'http': get_asgi_application(),
		'websocket': AllowedHostsOriginValidator(
			JwtAuthMiddleware(URLRouter(websocket_urlpatterns))
		)
	}
)

