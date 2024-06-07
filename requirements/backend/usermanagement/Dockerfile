FROM python:3.9

WORKDIR /app

COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

ENTRYPOINT [ "sh", "start.sh" ]

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "usermanagement.wsgi:application"]


