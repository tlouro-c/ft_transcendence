FROM python:3.9

WORKDIR /app

COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

ENTRYPOINT [ "sh", "start.sh" ]

CMD ["python", "game/manage.py", "runserver", "0.0.0.0:7000"]


