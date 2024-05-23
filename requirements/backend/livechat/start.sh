#!/bin/bash

find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
python livechat/manage.py makemigrations
python livechat/manage.py migrate
python livechat/manage.py createcachetable

if [ "$DJANGO_SUPERUSER_USERNAME" ]
then
    python livechat/manage.py createsuperuser \
        --username $DJANGO_SUPERUSER_USERNAME \
		--noinput \
		--email $DJANGO_SUPERUSER_EMAIL
fi

$@
