# What it does
Handles registering a new User to be stored in the User Database and can be found at `/register`,
when called with `POST`

# Parameters
| Name     | Type         | Where to pass? | Description                                          |
|----------|--------------|----------------|------------------------------------------------------|
| name     | string       | body           | The display name for that account                    |
| email    | string/email | body           | The E-Mail Address associated with that user account |
| password | string       | body           | The Password used to log into that account           |

# Response
| Format | Structure        | Description                                       |
|--------|------------------|---------------------------------------------------|
| JSON   | {"token": token} | An access token used to interact with the service |

# Example
Request:
```http request
POST http://api.url/register
Content-Type: application/json

{
    "name": "Example User",
    "email": "mail@example.com",
    "password": "DoNotUseThisPassword!"
}
```

Response:
```json
{
  "token": "example-api-token"
}
```

# Documentation
This Endpoint takes the given arguments and if they are correct, will create a new user (given)
another account is not already registered with that email and store it to the user Database.
If this is successful, it will return an access token that the client can use to interact with the API.

# Notes
The token response will soon be removed in favor of using cookie authentication.