<h1 align="center">Buzz Wise Cloud Computing<h1>

<h2>Deployment</h2>

<h3>Databases</h3>

![Databases](https://github.com/BuzzWiseTeam/BuzzWiseCloudComputing/blob/main/public/images/Database.png)

<h3>BackEnd Services</h3>

![BackEnd](https://github.com/BuzzWiseTeam/BuzzWiseCloudComputing/blob/main/public/images/BackEnd.png)

<h2>Setup & Installation</h2>

<h3>Node.js & NPM</h3>

- Install all of the dependencies: `npm install`
- Run in the Development server: `npm run dev`
- Start the project: `npm run start`
- Testing: `npm run test`

<h3>Docker</h3>

- Docker build: `docker build -t buzz-wise-backend .`
- Docker run container: `docker run -it -p 8080:8080 --name=buzzwisebackend buzz-wise-backend`
- Docker start: `docker start buzzwisebackend`
- Docker Stop: `docker stop buzzwisebackend`
- Docker remove: `docker rm buzzwisebackend`

<h3>Google Cloud Platform (GCP) Services</h3>

- Cloud Run update service: `gcloud run services update buzzwisebackend --port 8080`
