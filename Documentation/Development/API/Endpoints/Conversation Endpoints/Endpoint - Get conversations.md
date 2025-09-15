# What it does
Returns all conversations the user has access to and can be found at `/conversation` when called with `GET`

# Parameters
This Endpoint does not take any parameters as input.

# Response
| Format | Structure                                                     | Description                                          |
|--------|---------------------------------------------------------------|------------------------------------------------------|
| JSON   | {"conversations":[{"name": name, "id": ID}]} | An array of all conversations the user has access to |

# Example

Request:
```http request
GET https://api.url/conversation
Content-Type: application/json
```

Response
```json
{"conversations": [
  {
    "name": "Example Conversation 1",
    "id": "example-id-string-1"
  },
  {
    "name": "Example Conversation 2",
    "id": "example-id-string-2"
  }
]}
```

# Documentation
When called, it will fetch all available conversations from the Database and return them as an array
containing the names and IDs of each conversation.

# Notes
Currently responds with **all** conversations in the Database