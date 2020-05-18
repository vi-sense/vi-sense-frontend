# vi-sense frontend

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

##Run with docker compose 
- clone the visense-backend repo
- navigate to root of backend repo
- the following command starts the webpack dev server with hot reload as well as postgres and the backend process
> FRONTEND_DIR=[path_to_frontend_repo] docker-compose up --build		#builds and starts the app in dev mode, using the source code on the machine
