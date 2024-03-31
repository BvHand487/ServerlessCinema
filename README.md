*Author: ChatGPT*

# Cinema Azure Functions App

## Overview

This serverless Azure Functions application is designed to manage a cinema database, allowing users to interact with movies and reviews. The application utilizes Azure SQL Database to store movie and review data. Additionally, it features HTTP-triggered Azure Functions to handle GET/POST requests for movies and reviews, as well as a time-triggered function to calculate the average rating of movies daily at 11:30 AM.

<br/>

## Technologies Used

- **Azure Functions**: Serverless compute service used to implement HTTP-triggered and time-triggered functions.
- **Azure SQL Database**: Cloud-based relational database service used to store movie and review data.
- **Javascript (Node.js)**: Programming language used to write Azure Functions.
- **Azure Portal**: Web-based interface used for managing Azure resources and deploying functions.

<br/>

## API Endpoints

- ### Movies

  - **GET /api/movies**: Retrieve a list of the 10 best rated movies.
  - **GET /api/movies?title={...}**: Retrieve the movie that best matches the query parameter.
  - **POST /api/movies?title={...}&year={...}&genre={...}&description={...}&director={...}&actors={...}**: Add a new movie to the database. 'genres' and 'actors' are comma-separated lists of strings.

- ### Reviews

  - **GET /api/reviews?title={...}**: Retrieves a list of all reviews of the best matching movie.
  - **POST /api/reviews?title={...}&review={...}&rating={...}&date={...}&author={...}**: Adds a new review to the best matching movie.

## Time-triggered Function

- **averageRating**: Triggered daily at 11:30 AM to calculate the average rating of movies.
