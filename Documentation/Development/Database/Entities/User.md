The User Entity stores, as the name suggests Users. It's related to the [[Conversation|Conversation Entity]] in a Many to Many Configuration, to allow multiple users to access the same conversation.

| id                | name   | email  | passwordHash | Conversations                   |
| ----------------- | ------ | ------ | ------------ | ------------------------------- |
| primaryKey<br>int | string | string | string       | Many to many with conversations |
