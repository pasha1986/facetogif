FROM nginx
MAINTAINER Pavel Shklovsky

COPY index.html /usr/share/nginx/html/index.html
COPY app.css /usr/share/nginx/html/app.css
COPY js/ /usr/share/nginx/html/js/

