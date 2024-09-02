let actionBuffer = "";
let activityRead = 0;
let aiMessage;

// Encode an image that would be provided by an HTML element, not really implemented yet
function encodeImageFile(element) {
    let file = element.files[0];
    // reader = new FileReader();
    reader.onloadend = function() {
        console.log('Result', reader.result.split(',')[1]);
    }
    reader.readAsDataURL(file);
}

// Triggers when the user sends his message
async function sendRequest() {
    const textarea = document.getElementById("query");
    aiMessage = "";
    
    cssRoot.style.setProperty("--outline-color", '#00d0ff');
    console.log(messageObjects);
    
    // Add the message to the "messageObjects" object
    try
    {
        messageObjects.push({"role": "user", "content": textarea.value, "images": [reader.result.split(',')[1]]});
    }
    catch
    {
        messageObjects.push({"role": "user", "content": textarea.value});
    }
    
    // Retrieve that messageObjects container element
    messageElements.push(new Message("user"));
    console.log(messageElements);
    messageElements[messageElements.length - 1].pushText(textarea.value);
    await saveMessage("user", textarea.value, activeConversation.id);
    activeMessage = new Message("assistant");
    messageElements.push(activeMessage);
    
    // Build request
    let url = "http://localhost:11434/api/chat";
    const data = {
        "model": "custllama3.1",
        "messages": messageObjects,
    };

    // Clear the user's input field
    textarea.value = "";

    const requestOptions = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };

    // Request with the provided data
    fetch(url, requestOptions)
        .then(res => res.body)
        .then(rb => {
            const reader = rb.getReader();

            return new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(async ({done, value}) => {
                            // Close connection if done is set to true
                            if (done) {
                                console.log("done", done);
                                controller.close();
                                return;
                            }
                            // Fetch the individual words
                            await controller.enqueue(value);
                            let json = JSON.parse(new TextDecoder().decode(value));
                            //console.log(json);
                            let word = json.message.content;
                            console.log(word);
                            // Todo: Rework this to support more complex syntax
                            //      also implementing an ongoing stream across many messageObjects to expand upon scripts -- oh boi, i don't think this will happen anytime soon
                            //      Maybe another format?
                            //      Also maybe feed python errors back into the AI for automatic correction -- works, but the AI rather just hallucinates outcomes than actually just reading the new message... bummers

                            // activity read is > 0 when a python script is being sent
                            // actionBuffer stores the current script
                            switch (activityRead > 0)
                            {
                                // If a script is being sent
                                case true:
                                    // Update activity read to account for newly found brackets
                                    activityRead += (word.match(/{/g) || []).length;
                                    activityRead -= (word.match(/}/g) || []).length;

                                    // If it's still above 0
                                    if (activityRead > 0) {
                                        // add the current word to the action buffer
                                        actionBuffer += word;
                                    }

                                    // If that ended the script:
                                    else {
                                        // add the last word
                                        actionBuffer += word;
                                        // Notify the user and send the script to the backend server
                                        await sendAction(actionBuffer);
                                        // clear the action buffer
                                        actionBuffer = "";
                                    }
                                    break;
                                
                                // If no script is being sent
                                case false:
                                    // Update activity read to account for newly found brackets
                                    activityRead += (word.match(/{/g) || []).length;
                                    activityRead -= (word.match(/}/g) || []).length;

                                    // If there is still no script being sent
                                    if (!activityRead > 0) {
                                        // Update the active message with the new response and scroll down (scrolling needs fix, don't know why)
                                        activeMessage.pushText(word);
                                        // Add the current word to the AI's response
                                        aiMessage += word;
                                        chatbox.scrollTop = chatbox.scrollHeight;
                                    }

                                    // If there is now a script being sent
                                    else {
                                        // Update the action buffer
                                        actionBuffer += word;
                                        // Notify the user
                                        activeMessage.createPyout()
                                        activeMessage.setCode("Writing");
                                    }
                                    break;
                            }
                            push();
                        });
                    }
                    push();
                }
            });
        })
        .then(stream =>
            new Response(stream, { headers: { "Content-Type": "text/html" } }).text()
        )
        .then(async (result) => {
            // Update the messageObjects and cookie
            console.log(aiMessage);
            cssRoot.style.setProperty("--outline-color", 'transparent');
            messageObjects.push({"role": "assistant", "content": aiMessage});
            saveMessage("assistant", aiMessage, activeConversation.id);
            // if the action buffer still contains a script (should never happen)
            if (actionBuffer.length > 0) {
                // send that script and clear the action buffer
                await sendAction(actionBuffer);
                actionBuffer = "";
            }
        });
}

// This function handles communication with the backend
async function sendAction(code) {
    activeMessage.setCode("Running");
    // Clear up the requested code if it contains unwanted letters
    while (code.charAt(code.length -1 ) === "}" || code.charAt(code.length -1 ) === "\n" || code.charAt(code.length -1 ) === " ") {
        console.log(`Found ${code.charAt(code.length -1)} at the end of the code, removing it.`)
        code = code.substring(0, code.length - 1);
    }

    while (code.charAt(0) === "{" || code.charAt(0) === "\n" || code.charAt(0) === " ") {
        console.log(`Found ${code.charAt(0)} at the beginning of the code, removing it.`)
        code = code.substring(1);
    }
    
    console.log(code)
    
    // Send a request to the backend server 
    fetch("http://127.0.0.1:3000/action", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"query": code}),
    })
        .then(res => res.body)
        .then(rb => {
            const reader = rb.getReader();
            
            return new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(async ({done, value}) => {
                            // End the communication if done is set to true
                            if (done) {
                                controller.close();
                                return;
                            }
                            await controller.enqueue(value);
                            try {
                                // Decode the response stream
                                console.log("Decoded Value:" + new TextDecoder().decode(value));
                                let json = JSON.parse(new TextDecoder().decode(value));
                                
                                // If the response contains data
                                if (json.data !== undefined) {
                                    // Update the active message and scroll down
                                    activeMessage.pushResult(json.data);
                                    console.log(json.data);
                                    chatbox.scrollTop = chatbox.scrollHeight;
                                }
                            }
                            catch (err) {
                                console.error(err);
                                console.log(new TextDecoder().decode(value))
                            }
                            push();
                        });
                    }
                    push();
                }
            });
        })
        .then(stream =>
            new Response(stream, { headers: { "Content-Type": "text/html" } }).text()
        )
        .then((answer) => {
            // Reformat the answer string to convert it to an array of JSON objects
            let answerStringArray = answer.replaceAll(/}{/g, "}|{").split("|");
            let answerArray = [];

            // Convert the answer string
            answerStringArray.forEach((item) => {
                try {
                    answerArray.push(JSON.parse(item.replace("\\n", "")));
                }
                catch (e) {
                    console.error(e);
                }
            });
            
            console.log(answerArray);

            let result = { data: [] };

            answerArray.forEach(obj => {
                if ('data' in obj) {
                    result.data.push(obj.data);
                }
                
                if ('error' in obj)
                {
                    result.error = obj.error;
                }
                
                if ('code' in obj) {
                    result.code = obj.code;
                    chatbox.scrollTop = chatbox.scrollHeight;
                    activeMessage.setCode(result.code);
                }
            });

            if (result.data.length === 0) {
                delete result.data;
            }
            
            else {
                result.data = result.data.join('\\n');
            }
            
            if (result.error)
            {
                console.log("Reported error");
                activeMessage.pushError(result.error);
            }
            
            messageObjects.push({"role": "assistant", "content": aiMessage});
            messageObjects.push({"role": "system", "content": JSON.stringify(result)});
            saveMessage("system", JSON.stringify(result), activeConversation.id);
        })
        .catch((err) => {
            activeMessage.pushError(err);
            activeMessage.setCode(1);
        });
}

async function generateConversations() {
    let res = [];
    let url = `http://localhost:3000/conversation`;
    let requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }
    
    await fetch(url, requestOptions)
        .then(res => res.json())
        .then(result => {
            result.conversations.forEach(conversation => {
                res.push(new Conversation(conversation.id, conversation.name));
            });
        });
    return res;
}

async function saveMessage(role, message, conversationId) {
    let url = `http://localhost:3000/message/${conversationId}`;
    let requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({"role": role, "content": message}),
    }
    
    await fetch(url, requestOptions)
        .then(res => res.json())
        .then(result => {
            console.log(result);
        });
}

async function getMessages(id) {
    let res = [];
    let url = `http://localhost:3000/message/${id}`;
    let requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }
    
    await fetch(url, requestOptions)
        .then(res => res.json())
        .then(result => {
            res.push(systemMessage);
            result.messages.forEach(message => {
                res.push(message);
            });
        });
    return res;
}