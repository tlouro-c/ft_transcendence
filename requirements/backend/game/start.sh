#!/bin/bash

find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
python game/manage.py makemigrations --no-input
python game/manage.py migrate --no-input

if [ "$DJANGO_SUPERUSER_USERNAME" ]
then
    python game/manage.py createsuperuser \
        --username $DJANGO_SUPERUSER_USERNAME \
		--noinput \
		--email $DJANGO_SUPERUSER_EMAIL
fi

cd game

$@
