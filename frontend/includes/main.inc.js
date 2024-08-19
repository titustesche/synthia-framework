let messages;
let reader = new FileReader();
let actionBuffer = "";
let activityRead = false;

window.onload = function() {
    messages = [{
        "role": "system",
        "content":
            "You have the ability to send Python code to a backend server to execute specific tasks." +
            "For simple queries or basic information, you can provide direct answers without needing a script." +
            "If there's a need for executing a complex task, write a script surrounded by {} and separate individual lines with \n." +
            "For example: {line1\nline2\nline3}. You can use as many lines as needed" +
            "The os, webbrowser, random, time and tkinter (as tk) modules are already imported and can be used. DO not use any import statements in these tasks" +
            "The system that executes these commands is Fedora Linux, you should never use sudo." +
            "Try to only use direct console commands through the os library, preferably systemctl or loginctl for session management." +
            "These Scripts should always be the first thing in your response, make them as short and simple as possible." +
            "NEVER use a script to solve a request that can be completed with language like math operations or texts." +
            "Everything file related should happen in the folder /home/titus and one of its subfolders like" +
            "Bilder, Schreibtisch or Downloads. The Desktop at use is KDE Plasma 6," +
            "Do not overengineer any command, just use the most simple, straight forward solution there is for anything," +
            "remember that you can only use python and the two imported libraries" +
            "You should always write a few confirming sentences after you executed a task"
    }];
}

function encodeImageFile(element)
{
    let file = element.files[0];
    // reader = new FileReader();
    reader.onloadend = function() {
        console.log('Result', reader.result.split(',')[1]);
    }
    reader.readAsDataURL(file);
}

function sendRequest() {
    const chatbox = document.getElementById('chatbox');
    const prompt = document.getElementById("query").value;
    let ai_message = "";
    // messages = document.cookie !== "" ? decodeURIComponent(document.cookie).split(';') : {};
    console.log(messages);
    try
    {
        messages.push({"role": "user", "content": prompt, "images": [reader.result.split(',')[1]]});
    }
    catch
    {
        messages.push({"role": "user", "content": prompt});
    }
    
    chatbox.innerHTML += "<p class='message' id='user'>" + prompt + "</p>" + "<p class='message' id='ai'>";
    let url = "http://localhost:11434/api/chat";
    const data = {
        "model": "custllama3.1",
        "messages": messages,
    };

    console.log(data);

    const requestOptions = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };

    fetch(url, requestOptions)
        .then(res => res.body)
        .then(rb => {
            const reader = rb.getReader();
            
            return new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(async ({done, value}) => {
                            if (done) {
                                chatbox.innerHTML += "</p>";
                                console.log("done", done);
                                controller.close();
                                return;
                            }
                            // Fetch the individual words
                            await controller.enqueue(value);
                            let json = JSON.parse(new TextDecoder().decode(value));
                            let word = json.message.content;
                            
                            switch (activityRead)
                            {
                                case true:
                                    if (!word.includes('}')) {
                                        actionBuffer += word;
                                    }
                                    else
                                    {
                                        actionBuffer += word;
                                        activityRead = false;
                                        sendAction(actionBuffer.replace('}', ''));
                                        actionBuffer = "";
                                    }
                                    break;
                                    
                                case false:
                                    if (!word.includes('{'))
                                    {
                                        chatbox.innerHTML += json.message.content;
                                    }
                                    
                                    else
                                    {
                                        activityRead = true;
                                    }
                                    break;
                            }
                            
                            // needs to be done anyway
                            console.log(JSON.stringify(json.message.content));
                            ai_message += json.message.content;
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
        .then(result => {
            messages.push({"role": "assistant", "content": ai_message});
            document.cookie = `messages: ${messages}`;
            if (actionBuffer.length > 0) {
                sendAction(actionBuffer.replace('}', ''));
                actionBuffer = "";
            }
        });
}

function sendAction(code)
{
    code.replace(';', '\n');
    console.log(code)
    fetch("http://127.0.0.1:3000/action", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"query": code}),
    })
        .then(res => res.json())
        .then(res => {
            if (res === 1)
            {
                alert("Python process failed executing");
            }
        });
}