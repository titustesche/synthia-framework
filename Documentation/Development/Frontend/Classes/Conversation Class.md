The Conversation Class is used to represent Conversations and store their information for accessing the Database. It is located in `frontend/includes/ui_updates.inc.js`
# 1 - Constructor
The Conversation Class has a constructor which takes `id` and `name` as inputs to store them for further use.

# 2 - Attributes
| Name   | Type        | Description                                            | Automatically generated at runtime? |
| ------ | ----------- | ------------------------------------------------------ | ----------------------------------- |
| id     | int         | Stores the ID of that Conversation from the Database   | Yes                                 |
| name   | string      | Stores the Name of this Conversation from the Database | Yes                                 |
| object | DOM-Element | Represents the clickable Object for this Conversation  | No                                  |

# 3 - Methods
| Name   | Type | Parameters             | Description                                                                  | Notes |
| ------ | ---- | ---------------------- | ---------------------------------------------------------------------------- | ----- |
| render | void | container: DOM-Element | Renders a clickable Box representing the Conversation in the given container | -     |
