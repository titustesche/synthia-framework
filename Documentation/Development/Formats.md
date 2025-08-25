# Overview - Formats
A List of standardized formats used throughout the Project

## Database
### Users
### Conversations
### Messages
The messages are stored as an array of different Message Elements.
These can be anything really, as they consist of a descriptor and the content, e.g:
`[{"type":"text","content":"Hello world!"},{"type":"script","content":"print('Hello world')"}]`