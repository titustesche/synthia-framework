The Conversation Entity stores all Conversations and associates them with their Corresponding [[User|Users]], [[Message|Messages]] and [[Configuration|Configurations]]

| id                | name   | messages                 | users                  | configuration                  |
| ----------------- | ------ | ------------------------ | ---------------------- | ------------------------------ |
| primaryKey<br>int | string | One to Many with Message | Many to Many with User | Many to One with Configuration |
