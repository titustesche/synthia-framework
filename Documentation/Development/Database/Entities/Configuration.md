The Configuration Entity stores [[Conversation]] Configurations and associates them with one or more [[Conversation|Conversations]] and the [[User]] it belongs to. It defines the characteristics of the Conversation and can be customized by the [[User]]

| id  | name   | assistantName | systemMessage | user                  | conversations                 | allowScript |
| --- | ------ | ------------- | ------------- | --------------------- | ----------------------------- | ----------- |
| int | string | string        | text          | Many to One with User | One to Many with Conversation | boolean     |
 