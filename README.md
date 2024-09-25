# Book Notes using NodeJS & PostgreSQL
The "ReadCapture" is a web application built using Node.js, Express, Axios, pg (PostgreSQL), and EJS. It provides users with the ability to organize and add notes to their favorite books, along with additional details like reviews or ratings. One of the key features of this application is its ability to automatically find and display the cover image of each added book.
# Environment vars
This project uses the following environment variables:

| Name                          | Description                         | Default Value                                  |
| ----------------------------- | ------------------------------------| -----------------------------------------------|
|PG_USER           | User of pgAdmin4            | "postgres"      |
|PG_HOST           | Hostname PostgreSQL database server       | "localhost"      |
|PG_DATABASE           |  Name of the PostgreSQL database       | "ReadCapture"      |
|PG_PASSWORD           |  Password required when connecting to the PostgreSQL database       | ""      |
|PG_PORT           |  Port number for PostgreSQL database connections      | "5432"      |


# Pre-requisites
- Install [Node.js](https://nodejs.org/en/) version 20.11.1
- Create a PostgreSQL database named "ReadCapture" and create required tables (See book_notes_database.sql)


# Getting started

- Install dependencies
```
cd <project_name>
npm install
```
- Run the project
```
node index.js
```
  Navigate to `http://localhost:3000`

This is the preview.
![image](https://github.com/user-attachments/assets/43711b77-6613-423f-93f7-a8cd258eb1de)
