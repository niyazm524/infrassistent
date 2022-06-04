#!/bin/bash

cleanup() {
	echo "Terminating..."
    sudo -u postgres /etc/init.d/postgresql stop
    exit 0
}

trap "cleanup" SIGTERM

if [ -s "/var/lib/postgresql/10/main/PG_VERSION" ]; then
	echo "starting postgres"
		
	#Execute a command
	sudo -u postgres /usr/lib/postgresql/10/bin/postgres -D /var/lib/postgresql/10/main -c config_file=/etc/postgresql/10/main/postgresql.conf &
	tail -f /dev/null
	#Wait
	# wait $!

else
	apt-get update && apt-get install -y postgresql-10 postgresql-client-10 postgresql-contrib-10 postgresql-10-plv8
	sudo -u postgres /etc/init.d/postgresql start && sudo -u postgres psql --command "ALTER USER postgres WITH PASSWORD '$1';"

	sudo -u postgres tee -a /etc/postgresql/10/main/postgresql.conf > /dev/null <<EOL
listen_addresses='*'
wal_level = logical
hot_standby = on
max_wal_senders = 6
max_replication_slots = 10
EOL

	sudo -u postgres tee -a /etc/postgresql/10/main/pg_hba.conf > /dev/null <<EOT
host all  all    0.0.0.0/0  md5
host replication				replica					188.127.229.201/32	md5
host replication				replica					91.206.15.134/32	md5
host replication				replica					92.53.64.32/32	    md5
EOT
	
	echo "Now restarting..."
	sudo -u postgres /etc/init.d/postgresql stop
	exit 1
fi
