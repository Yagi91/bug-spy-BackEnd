# Bug-spy-BackEnd

The server-side code of my bug-spy app with node.js, express, and MongoDB

## Description

The app is structured as follows:

- The config folder contains the environment variables for the app.
- The controller's folder contains the code for the API endpoints.
- The helpers folder contains utility functions.
- The models folder contains the MongoDB models.
- The routes folder contains the routing configuration for the app.
- The server.js file is the main entry point for the app.
- The config folder contains the following environment variables:

MONGODB_URI: The URI for the MongoDB database.
PORT: The port that the app will listen on.
DEBUG: A comma-separated list of environment variables to log.
The controllers folder contains the code for the API endpoints. Each endpoint is a function that takes a request object and a response object as arguments. The function performs the desired operation and then returns the response object.

For example, the createBug controller function creates a new bug in the database. The function takes a request object that contains the bug information as arguments. The function then creates a new MongoDB document and inserts it into the database. The function then returns a response object that contains the ID of the new bug.

The helpers folder contains utility functions that are used by the other parts of the app. For example, the getUserId function gets the ID of the current user from the request object.

The models folder contains the MongoDB models. Each model represents a collection in the database. The models provide methods for accessing and manipulating the data in the collection.

For example, the Bug model represents the bug collection. The Bug model has methods for getting, creating, updating, and deleting bugs.

The routes folder contains the routing configuration for the app. The routes file defines the URL paths for the API endpoints.

The server.js file is the main entry point for the app. The file initializes the Express app and then attaches the controllers and routes to the app.

The app uses the following technologies:

Node.js: A JavaScript runtime environment.
Express: A web application framework for Node.js.
MongoDB: A NoSQL database.
The app can be deployed to a cloud server or a local machine. To deploy the app to a cloud server, you can use a service like Heroku or AWS Elastic Beanstalk. To deploy the app to a local machine, you can use the npm run deploy command.

## Getting Started

### Dependencies

* Nodejs16, Docker, Python >=3.8, Google cloud CLI .

### Installing

```
npm install
```

### Executing program

* How to run the program
* Step-by-step bullets
```
npm run development
```
* How to deploy the program.
```
gcloud run deploy
```

## Help

The MONGO_URI needed to connect to the database is found in the dotenv files.
You do need a project on the Google Cloud platform.
Check the [steps](https://cloud.google.com/eclipse/docs/create-flex-app) to get a project up an running with App engine.
```
command to run if the program contains helper info
```

## Authors

Bryan Timah
[LinkedIn](https://www.linkedin.com/in/bryan-timah/)
[@Bryan_coder:Twitter](https://twitter.com/D_africanknight)


## License

This project is licensed under the MIT License.
