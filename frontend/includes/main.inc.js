let messages;
let reader = new FileReader();
let actionBuffer = "";
let activityRead = 0;
let chatbox;
let query;
let glassWrapper;

window.onload = function() {
    chatbox = document.getElementById('chatbox');
    glassWrapper = document.getElementById('glassWrapper');
    messages = [{
        "role": "system",
        "content":
            "You have the ability to send Python code to a backend server to execute specific tasks." +
            "For simple queries or basic information, you can provide direct answers without needing a script." +
            "If there's a need for executing a complex task, write a script surrounded by {} and separate individual lines with \n." +
            "For example: {line1\nline2\nline3}. You can use as many lines as needed." +
            "Using any { or } inside the code is strictly forbidden." +
            "The os, webbrowser, random, time and tkinter (as tk) modules are already imported and can be used." +
            "You are not allowed to use any further import statements in your scripts!" +
            "The system that executes these commands is Fedora Linux, you should never use sudo." +
            "Try to only use direct console commands through the os library, preferably systemctl or loginctl for session management." +
            "These Scripts should always be the first thing in your response, make them as short and simple as possible." +
            "NEVER use a script to solve a request that can be completed with language like math operations or texts." +
            "Everything file related should happen in the folder /home/titus and one of its subfolders like" +
            "Bilder, Desktop or Downloads. The Desktop at use is KDE Plasma 6," +
            "Do not overengineer any command, just use the most simple, straight forward solution there is for anything," +
            "remember that you can only use python and the two imported libraries" +
            "You should always write a few confirming sentences after you executed a task" +
            "You are allowed to make a maximum of 2 requests in one answer." +
            "Every time a script is executed, the system will send a message with the format" +
            "Python code execution completed. Exit code: exit-code, console output: output." +
            "This output will be accessible with the first message after the request has been sent." +
            "Use that to validate if everything went how it should have." +
            "When creating a tkinter instance, the window has to be initialized with root = tk.Tk()." +
            "Also note that tkinter is already imported as tk"
    }];

    if (document.cookie)
    {
        let cookie = JSON.parse(document.cookie);
        for(let i = 1; i < cookie.messages.length; ++i) {
            messages.push(cookie.messages[i]);
            chatbox.innerHTML += `<p> ${cookie.messages[i].content} </p>`;
        }
    }
    
    query = document.getElementById('query');
    query.addEventListener('keydown', function(e) {
        if (e.code === 'Enter' && !e.shiftKey)
        {
            e.preventDefault();
            sendRequest();
            this.style.height = 'auto';
            this.style.height = `min(${this.scrollHeight/2}px, 100px)`;
        }
    });
    
    query.addEventListener('input', function(e) {
        this.style.height = 'auto';
        this.style.height = `min(${this.scrollHeight}px, 100px)`;
    });
    
    document.getElementsByTagName('body')[0].addEventListener('mousemove', function(e) {
        let elementWidth = glassWrapper.offsetWidth;
        let elementHeight = glassWrapper.offsetHeight;
        let posX = glassWrapper.offsetLeft;
        let posY = glassWrapper.offsetTop;
        
        let mouseX = (e.pageX - posX) / elementWidth * 100;
        let mouseY = (e.pageY - posY) / elementHeight * 100;
        
        glassWrapper.style.backgroundImage = `radial-gradient(circle farthest-corner at ${mouseX}% ${mouseY}%, #CCCCCC22 5px, #00000000 50px)`;
    });
    
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
    const textarea = document.getElementById("query");
    let ai_message = "";
    // messages = document.cookie !== "" ? decodeURIComponent(document.cookie).split(';') : {};
    console.log(messages);
    try
    {
        messages.push({"role": "user", "content": textarea.value, "images": [reader.result.split(',')[1]]});
    }
    catch
    {
        messages.push({"role": "user", "content": textarea.value});
    }
    
    chatbox.innerHTML += "<p class='message' id='user'>" + textarea.value + "</p>" + "<p class='message' id='ai'>";
    chatbox.scrollTop = chatbox.scrollHeight;
    let url = "http://localhost:11434/api/chat";
    const data = {
        "model": "custllama3.1",
        "messages": messages,
    };

    // Ab hier wird textarea nicht mehr verwendet
    textarea.value = "";
    console.log(textarea.value);

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
                            //console.log(json);
                            let word = json.message.content;
                            
                            // Todo: Work on task detection to account for curly brackets in the code
                            //      also implementing an ongoing stream across many messages to expand upon scripts
                            //      Maybe another format?
                            //      Also maybe feed python errors back into the AI for automatic correction
                            // activityRead += word.match('/{/g') || [].length;
                            // activityRead -= word.match('/}/g') || [].length;
                            switch (activityRead > 0)
                            {
                                // activity read ist größer 0 wenn python script gesendet wird
                                // actionBuffer hält das aktuelle skript
                                case true:
                                    activityRead += (word.match(/{/g) || []).length;
                                    activityRead -= (word.match(/}/g) || []).length;
                                    
                                    if (activityRead > 0) {
                                        actionBuffer += word;
                                        console.log(actionBuffer);
                                    }
                                    
                                    else {
                                        actionBuffer += word;
                                        console.log(actionBuffer);
                                        chatbox.innerHTML += "<div>Python output:";
                                        await sendAction(actionBuffer);
                                        actionBuffer = "";
                                        return;
                                    }
                                    break;
                                    
                                case false:
                                    activityRead += (word.match(/{/g) || []).length;
                                    activityRead -= (word.match(/}/g) || []).length;
                                    
                                    if (!activityRead > 0) {
                                        chatbox.innerHTML += word;
                                        chatbox.scrollTop = chatbox.scrollHeight;
                                    }
                                    
                                    else {
                                        actionBuffer += word;
                                        chatbox.innerHTML += "</> Working..."
                                    }
                                    break;
                            }
                            
                            // needs to be done anyway
                            // console.log(JSON.stringify(json.message.content));
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
        .then(async (result) => {
            messages.push({"role": "assistant", "content": ai_message});
            // document.cookie = `{ "messages": ${JSON.stringify(messages)} }`;
            if (actionBuffer.length > 0) {
                await sendAction(actionBuffer);
                actionBuffer = "";
            }
        });
}

async function sendAction(code)
{
    let response = "";
    while (code.charAt(code.length -1 ) === "}" || code.charAt(code.length -1 ) === "\n" || code.charAt(code.length -1 ) === " ") {
        console.log(`Found ${code.charAt(code.length -1)} at the end of the code, removing it.`)
        code = code.substring(0, code.length - 1);
    }

    while (code.charAt(0) === "{" || code.charAt(0) === "\n" || code.charAt(0) === " ") {
        console.log(`Found ${code.charAt(0)} at the beginning of the code, removing it.`)
        code = code.substring(1);
    }
    
    // code = code.charAt(code.length - 1) === "}" ? code.slice(0, code.length - 1) : code;
    console.log(code)
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
                            if (done) {
                                controller.close();
                                return;
                            }
                            await controller.enqueue(value);
                            try {
                                console.log("Decoded Value:" + new TextDecoder().decode(value));
                                let json = JSON.parse(new TextDecoder().decode(value));
                                if (json.data !== undefined) {
                                    chatbox.innerHTML += `<p>${json.data}</p>`;
                                    chatbox.scrollTop = chatbox.scrollHeight;
                                }
                            }
                            catch (err) {
                                console.error(err);
                                console.log(new TextDecoder().decode(value))
                            }
                            /*
                            let json = JSON.parse(new TextDecoder().decode(value));
                            response += json.data;
                             */
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
            console.log(answer);
            let answerStringArray = answer.replace(/}{/g, "}|{").split("|");
            console.log(answerStringArray);
            let answerArray = [];
            
            answerStringArray.forEach((item) => {
                try {
                    answerArray.push(JSON.parse(item.replace("\\n", "")));
                }
                catch (e) {
                    console.error(e);
                }
            })
            
            let result = { data: [] };
            
            answerArray.forEach(obj => {
                if ('data' in obj) {
                    result.data.push(obj.data);
                }
                if ('code' in obj) {
                    result.code = obj.code;
                    chatbox.innerHTML += `<p>Exit code: ${result.code} </p></div>`;
                    chatbox.scrollTop = chatbox.scrollHeight;
                }
            });
            
            console.log(result);
            messages.push({"role": "system", "content": `Python code execution completed. Exit code: ${result.code}, console output: ${result.data}`});
        });
}