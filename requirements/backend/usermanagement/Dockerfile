FROM python:3.9

WORKDIR /app

COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

RUN mkdir -p /etc/ssl/my_certs

ENTRYPOINT [ "sh", "start.sh" ]

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--certfile", "/etc/ssl/my_certs/cert.crt", "--keyfile", "/etc/ssl/my_certs/cert.key", "usermanagement.wsgi:application", "--ssl-version", "TLSv1_2"]


