# What it does
Handles the creation of new Conversations and can be accessed at `/conversation` when called with `POST`

# Parameters
| Name | Type   | Where to pass? | Description                      |
|------|--------|----------------|----------------------------------|
| name | string | body           | The name of the new Conversation |

# Response
| Format | Structure                                  | Description                                       |
|--------|--------------------------------------------|---------------------------------------------------|
| JSON   | {"conversation": {"name": name, "id": ID}} | The name and ID of the newly created conversation |

# Example
Request:
```http request
POST http://api.url/conversation
Content-Type: application/json

{
    "name": "Example Conversation 1"
}
```
Response:
```json
{
  "conversation":
  {
      "name": "Example Conversation 1",
      "id": "example-id-string"
  }
}
```

# Documentation
Tries to create a new conversation with the provided name.
If successful, it will return the name and ID of the newly created conversation.