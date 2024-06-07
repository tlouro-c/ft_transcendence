FROM python:3.9

WORKDIR /app

COPY . .


RUN pip install --upgrade pip
RUN pip install -r requirements.txt

ENTRYPOINT [ "sh", "start.sh" ]

CMD ["uvicorn", "game.asgi:application", "--host", "0.0.0.0", "--port", "8001"]



