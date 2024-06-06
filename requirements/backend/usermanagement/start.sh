#!/bin/bash

find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
python usermanagement/manage.py makemigrations
python usermanagement/manage.py migrate

if [ "$DJANGO_SUPERUSER_USERNAME" ]
then
    python usermanagement/manage.py createsuperuser \
        --username $DJANGO_SUPERUSER_USERNAME \
		--noinput
fi

cd usermanagement

$@
