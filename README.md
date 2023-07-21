# API Documentation for Fix It Together

This is the documentation for the API endpoints provided by the server.

## Base URL

The base URL for all API endpoints is: `https://fix-it-together-eda1be1fe9b5.herokuapp.com/api`

## Authentication

All authenticated endpoints require a valid JSON Web Token (JWT) in the `Authorization` header.

Example header:
```
Authorization: Bearer <token>
```

To obtain a token, use the login/signup endpoints.

**Note:** Replace `<token>` with the actual JWT token obtained during authentication.

## Endpoints

### User Registration

- **URL:** `/user/register`
- **Method:** `POST`
- **Description:** Registers a new user.
- **Request Body:**

| Field        | Type   | Description                |
|--------------|--------|----------------------------|
| `first_name` | String | First name of the user     |
| `last_name`  | String | Last name of the user      |
| `email`      | String | Email address of the user  |
| `password`   | String | Password for the user      |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "User registered successfully",
  "user_id": <user_id>,
  "token": "<token>"
}
```

### User Login

- **URL:** `/user/login`
- **Method:** `GET`
- **Description:** Authenticates a user.
- **Request Body:**

| Field    | Type   | Description                |
|----------|--------|----------------------------|
| `email`  | String | Email address of the user  |
| `password` | String | Password for the user      |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "User logged in successfully",
  "user_id": <user_id>,
  "token": "<token>"
}
```

### Get User Info

## Endpoint

- **URL** `/user`
- **Method:** `POST`
- **Description:** Creates a new issue.
- **Authentication:** Required

## Request Headers

Include the JWT token in the 'Authorization' header of the request.

Example:
```
Authorization: Bearer <your-jwt-token>
```

## Response

A successful request will return the user information (excluding the password) in JSON format.

Example Response:
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}
```

### Get All Issues

- **URL:** `/issues`
- **Method:** `GET`
- **Description:** Retrieves all issues.
- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body: Array of issue objects with the following properties:

```json
[
  {
    "id": <issue_id>,
    "user_id": Number,
    "title": String,
    "description": String,
    "date": String,
    "image": String,
    "location": String,
    "upvotes": Number,
    "downvotes": Number
  },
  ...
]
```

### Get Issue by ID

- **URL:** `/issues/:issue_id`
- **Method:** `GET`
- **Description:** Retrieves an issue by its ID.
- **Request URL Parameters:**

| Parameter    | Description        |
|--------------|--------------------|
| `issue_id`   | ID of the issue    |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body: Issue object with the following properties:

```json
{
  "id": <issue_id>,
  "user_id": Number,
  "title": String,
  "description": String,
  "date": String,
  "image": String,
  "location": String,
  "upvotes": Number,
  "downvotes": Number
}
```

### Create a New Issue

- **URL:** `/issues`
- **Method:** `POST`
- **Description:** Creates a new issue.
- **Authentication:** Required
- **Request Body:**

| Field        | Type   | Description                |
|--------------|--------|----------------------------|
| `title`      | String | Title of the issue         |
| `description`| String | Description of the issue   |
| `date`       | String | Date of the issue          |
| `image`      | String | Image URL for the issue    |
| `location`   | String | Location of the issue      |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Issue created successfully",
  "issue_id": <issue_id>
}
```

### Update an Issue

- **URL:** `/issues/:issue_id`
- **Method:** `PUT`
- **Description:** Updates an existing issue.
- **Authentication:** Required
- **Request URL Parameters:**

| Parameter    | Description         |
|--------------|---------------------|
| `issue_id`   | ID of the issue     |

- **Request Body:**

| Field        | Type   | Description               |
|--------------|--------|---------------------------|
| `title`      | String | Updated title of the issue |
| `description`| String | Updated description of the issue |
| `date`       | String | Updated date of the issue  |
| `image`      | String | Updated image URL for the issue |
| `location`   | String | Updated location of the issue |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Issue updated successfully",
  "issue_id": <issue_id>
}
```

### Delete an Issue

- **URL:** `/issues/:issue_id`
- **Method:** `DELETE`
- **Description:** Deletes an existing issue.
- **Authentication:** Required
- **Request URL Parameters:**

| Parameter    | Description         |
|--------------|---------------------|
| `issue_id`   | ID of the issue     |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Issue deleted successfully",
  "issue_id": <issue_id>
}
```

### Upvote an Issue

- **URL:** `/issues/:issue_id/upvote`
- **Method:** `POST`
- **Description:** Upvotes an issue.
- **Authentication:** Required
- **Request URL Parameters:**

| Parameter    | Description         |
|--------------|---------------------|
| `issue_id`   | ID of the issue     |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Issue upvoted successfully",
  "issue_id": <issue_id>
}
```

### Downvote an Issue

- **URL:** `/issues/:issue_id/downvote`
- **Method:** `POST`
- **Description:** Downvotes an issue.
- **Authentication:** Required
- **Request URL Parameters:**

| Parameter    | Description         |
|--------------|---------------------|
| `issue_id`   | ID of the issue     |

- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/json`
  - Body:

```json
{
  "message": "Issue downvoted successfully",
  "issue_id": <issue_id>
}
```