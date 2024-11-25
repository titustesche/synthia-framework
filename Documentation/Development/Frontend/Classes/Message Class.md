The Message Class is used to represent Messages - either rendered or not.
It's used to fully control the message's behavior and appearance, as well as it's contents. It is located in `frontend/includes/ui_updates.inc.js`

# 1 - Constructor
The Message class features a constructor which completely takes care of creating and rendering the Message if necessary. To create a new Message, call `new Message(<role>: string)` and pass the role for this message. The constructor will create all the message as well as all the Elements that compose it. After that, the message is automatically rendered if it's role is any other than `system`.

# 2 - Attributes
| Name        | Type        | Description                                                               | Automatically generated at runtime? |
| ----------- | ----------- | ------------------------------------------------------------------------- | ----------------------------------- |
| content     | string      | Stores the text content of the message                                    | Yes                                 |
| role        | string      | Stores the role that this message was sent by                             | Yes                                 |
| object      | DOM-Element | The HTML Object that represents this Message                              | Yes                                 |
| header      | DOM-Element | The HTML Object that makes up this message's Header                       | Yes                                 |
| body        | DOM-Element | The HTML Object that shows all the Contents of the message                | Yes                                 |
| pyout       | DOM-Element | An optional HTML Element that shows the output of a running python script | Yes                                 |
| pyoutResult | DOM-Element | An HTML Element that makes up the Content for the pyout element           | Yes                                 |
| pyoutCode   | DOM-Element | An HTML Element that makes up the exit code for the pyout element         | Yes                                 |
| pyoutHeader | DOM-Element | An HTML Element that makes up the Header for the pyout element            | Yes                                 |
## 2.1 - Attribute methods
| Name           | Type | Parameters           | Description                                        | Notes                                                                                         |
| -------------- | ---- | -------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| outline()      | get  | None                 | Returns the current state of the message's outline | -                                                                                             |
| outlineShape() | get  | None                 | Returns the current style of the message's outline | -                                                                                             |
| outline()      | set  | outline: bool        | Enables or disables this message's outline         | -                                                                                             |
| outlineShape() | set  | outlineShape: string | Sets the colors for the message's outline          | Outline shape is passed as an array of colors, which the method then builds a CSS string from |
# 3 - Methods
| Name           | Type | Parameters     | Description                                                                        | Notes                                                                                               |
| -------------- | ---- | -------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| createHeader() | void | None           | Creates a Header element, containing the role this message was sent by             | Get's called automatically when a Message Object is created (See [[#2 - Attributes \| Attributes]]) |
| createPyout()  | void | None           | Creates a pyout Element if needed                                                  | -                                                                                                   |
| pushResult()   | void | result: string | Adds a word to the message's active pyout element                                  | -                                                                                                   |
| pushError()    | void | error: string  | Displays an error in the message's active pyout                                    | -                                                                                                   |
| setCode()      | void | code: ENUM     | Sets the corresponding status code for the pyout when an Action is being performed | -                                                                                                   |
| pushText()     | void | text: string   | Adds a word to the message's content element                                       |                                                                                                     |

