FROM nginx

RUN apt-get update -y \
	&& apt-get install -y openssl

COPY config/nginx.conf /etc/nginx/conf.d/default.conf

COPY dist /usr/share/nginx/html

WORKDIR /etc/nginx

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout cert.key -out cert.crt -subj "/CN=localhost"

CMD ["nginx", "-g", "daemon off;"]
