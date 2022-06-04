FROM debian:stretch-slim

RUN set -eux; \
	groupadd -r postgres --gid=999; \
# https://salsa.debian.org/postgresql/postgresql-common/blob/997d842ee744687d99a2b2d95c1083a2615c79e8/debian/postgresql-common.postinst#L32-35
	useradd -r -g postgres --uid=999 --home-dir=/var/lib/postgresql --shell=/bin/bash postgres; \
# also create the postgres user's home directory with appropriate permissions
# see https://github.com/docker-library/postgres/issues/274
	mkdir -p /var/lib/postgresql; \
	chown -R postgres:postgres /var/lib/postgresql

RUN apt-get update
RUN apt-get install -y apt-utils
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y locales locales-all
ENV LC_ALL "ru_RU.UTF-8"
ENV LANG "ru_RU.UTF-8"
ENV LANGUAGE "ru_RU.UTF-8"

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y gnupg curl sudo nano

RUN echo "deb [arch=amd64] http://apt.postgresql.org/pub/repos/apt/ stretch-pgdg main" > /etc/apt/sources.list.d/pgdg.list
RUN curl -sSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

COPY ./startup.sh /startup.sh
COPY ./tini /tini
RUN chmod +x /startup.sh /tini

ENV POSTGRES_PASSWORD strongpassword

EXPOSE 5432-5441
VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]
ENTRYPOINT ["/tini", "-g", "--"]
CMD ["/bin/bash", "/startup.sh", "$POSTGRES_PASSWORD"]

