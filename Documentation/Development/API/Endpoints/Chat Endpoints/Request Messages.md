# What it does
This Endpoint currently lives in [conversation.ts](../../../../../src/routes/conversation.ts)
and is soon to be migrated to message.ts. 
# Parameters
| Name | Type | Where to pass? | Description          |
|------|------|----------------|----------------------|
| id   | int  | params         | The ID of the Survey |
# Response
| Format | Structure       | Description                                   |
|--------|-----------------|-----------------------------------------------|
| JSON   | {"messages":[]} | An array of Messages in their Database format |
# Documentation
Documentation of how it operates