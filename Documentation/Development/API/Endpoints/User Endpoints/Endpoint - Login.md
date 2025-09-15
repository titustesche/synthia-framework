# What it does
Handles logging into an existing account and can be found at `/login` when called with `POST`.
# Parameters
| Name     | Type         | Where to pass? | Description                                                  |
|----------|--------------|----------------|--------------------------------------------------------------|
| email    | string/email | body           | The E-Mail Address for the account that is trying to sing in |
| password | string       | body           | The Password associated with that account                    |

# Response
This Endpoint will not send any response other than a corresponding HTML status code.

# Example
Request:
```http request
POST http://api.url/login
Content-Type: application/json

{
    "email": "mail@example.com",
    "password": "DoNotUseThisPassword!"
}
```

Response:
`None/HTML Status`

# Documentation
This Endpoint takes the given arguments and compares them to the user database.
If a matching entry is found, it will return `200` and set a cookie that stores an access token
that the client can use to interact with the API.