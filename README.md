<h1 align="center">Buzz Wise Back-End<h1>

<h2>Setup & Installation</h2>

<h3>Node.js & NPM</h3>

- Install all of the dependencies: `npm install`
- Run the project: `npm run dev | npm run start | npm run test`

<h3>Docker</h3> 

- Docker build: `sudo docker build -t buzz-wise-api .`
- Docker run: `sudo docker run -it -p 1908:8080 --name=buzzwiseapi buzz-wise-api`
- Docker start: `sudo docker start buzzwiseapi`
- Docker Execute: `sudo docker exec -it buzzwiseapi bash`
- Docker Stop: `sudo docker stop buzzwiseapi`

<h3>Google Cloud Service</h3>

Make sure to put `serviceAccountKey.json` in the root directory.