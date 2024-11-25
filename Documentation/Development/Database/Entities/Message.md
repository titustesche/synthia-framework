The Message Entity stores all the messages and associates them with their corresponding [[Conversation]]

| id                | role   | content | conversation                  |
| ----------------- | ------ | ------- | ----------------------------- |
| primaryKey<br>int | string | text    | Many to One with Conversation |
