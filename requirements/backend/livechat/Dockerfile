FROM python:3.9

WORKDIR /app

COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

RUN mkdir -p /etc/ssl/my_certs

ENTRYPOINT [ "sh", "start.sh" ]

CMD ["uvicorn", "livechat.asgi:application", "--host", "0.0.0.0", "--port", "9000", "--ssl-keyfile=/etc/ssl/my_certs/cert.key", "--ssl-certfile=/etc/ssl/my_certs/cert.crt"]

