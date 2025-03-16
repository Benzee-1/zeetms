FROM postgres:15
COPY init.sql /docker-entrypoint-initdb.d/
ENV POSTGRES_DB=tms_db
ENV POSTGRES_USER=tms_user
ENV POSTGRES_PASSWORD=tms_secret_25