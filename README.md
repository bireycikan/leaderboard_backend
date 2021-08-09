# Leaderboard App

## Create your .env file under root directory

> Example .env file

```
REDIS_HOST=<host>
REDIS_PORT=<port>
REDIS_PASSWORD=<password>
REDIS_DB=<db>

DB=<mongodb_dbname>
DB_HOST=<mongodb_dbhost>
DB_PORT=<mongodb_dbport>
DB_USER=<mongodb_dbuser>
DB_PASSWORD=<mongodb_dbpassword>

PORT=<backend_service_port>
FRONT_END_SERVER_URI="<frontend_server_url>"
```

## For Development

> Install nodemon if it is not installed on your system

```
$ npm install nodemon -g
```

```
$ npm run dev
```

## For Production

```
$ npm run prod
```
