class Conversation {
    id;
    name;
    object;
    
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
    }
    
    render(container)
    {
        this.object = container.appendChild(document.createElement("div"));
        this.object.className = "conversation";
        this.object.innerText = this.name;
    }
}

class Message {
    // Content of the message for in program usage
    content;
    // The role as a string
    role;
    // The message's HTML element
    object;
    // The message's header child elements
    header;
    body;
    pyout;
    pyoutResult;
    pyoutCode;
    pyoutHeader;
    
    constructor (role) {
        this.role = role;
        this.object = chatbox.appendChild(document.createElement("div"));
        this.object.className = `msg_${role}`;
        this.header = this.object.appendChild(document.createElement("div"));
        this.header.setAttribute("class", "message-header");
        // Associate roles with their names and Print in Header
        this.createHeader();
        this.body = this.object.appendChild(document.createElement("div"));
        this.body.setAttribute("class", "message-body");

        this._outline = false;
        this._outlineShape = "#ffffffff";
        this.object.setAttribute("outline", this._outline);
        cssRoot.style.setProperty("--outline-shape", this._outlineShape);

        if (this.role === "user") { updateScroll(true); }
        else { updateScroll(); }
    }

    // The message outline's attributes
    // Todo: Implement these somehow?
    //  I don't really know why they are still around to be honest,
    //  but i like this approach so i'm gonna implement it
    get outline() { return this._outline; }
    get outlineShape() { return this._outlineShape; }
    set outline(outline) { this._outline = outline; this.toggleOutline(); }
    set outlineShape(outlineShape) { this._outlineShape = outlineShape; cssRoot.style.setProperty("--outline-shape", this._outlineShape); }
    
    toggleOutline() {
        switch (this._outline) {
            case true:
                this.object.setAttribute("outline", "true");
                break;
                
            case false:
                this.object.setAttribute("outline", "false");
                break;
        }
    }
    
    createHeader() {
        if (this.role === "user") {
            this.header.innerText = userName;
            this.header.style.color = "#25d80a";
        }
        
        else {
            this.header.innerText = assistantName;
            this.header.style.color = "#0a5fd8";
        }
    }
    
    createPyout() {
        //this.object.innerHTML += `<div class="pyout"><p class="pyout_header">Python output:</p><p class="pyout_result"></p><p class="pyout_code"></p></div>`;
        this.pyout = this.object.appendChild(document.createElement("div"));
        this.pyout.className = `pyout`;
        
        this.pyoutHeader = this.pyout.appendChild(document.createElement("div"));
        this.pyoutHeader.className = `pyout_header`;
        this.pyoutHeader.textContent = `Python output:`;
        
        this.pyoutResult = this.pyout.appendChild(document.createElement("div"));
        this.pyoutResult.className = `pyout_result`;
        this.pyoutResult.setAttribute("textCursor", "true");
        
        this.pyoutCode = this.pyout.appendChild(document.createElement("div"));
        this.pyoutCode.className = `pyout_code`;
        
        updateScroll();
    }
    
    pushResult(result) {
        this.pyoutResult.innerHTML += result;
        this.pyoutResult.scrollTop = this.pyoutResult.scrollHeight;
    }
    
    pushError(error) {
        this.pyoutResult.innerHTML += `<span style="color: #ff6f6f">${error}</span>`;
        this.pyout.scrollTop = this.pyout.scrollHeight;
        updateScroll();
    }
    
    setCode(code) {
        this.pyoutCode.innerHTML = `Status: ${code}`;
        switch (code) {
            case 1:
                this.pyoutCode.style.backgroundColor = '#af0000';
                this.outlineShape = '#ff0000';
                this.pyoutResult.setAttribute("textCursor", "false");
                break;
            
            case 0:
                this.pyoutCode.style.backgroundColor = '#005900';
                this.outlineShape = '#00ff00';
                this.pyoutResult.setAttribute("textCursor", "false");
                break;
                
            case "Running":
                this.pyoutCode.style.backgroundColor = '#a15b00';
                this.outlineShape = '#d89716';
                break;
                
            case "Writing":
                this.pyoutCode.style.backgroundColor = '#001ba3';
                this.outlineShape = '#0033ff';
                break;
        }
    }
    
    pushText(text) {
        this.body.innerHTML += text;
        this.content += text;
    }
}

async function updateMessages() {
    messageObjects = await getMessages(activeConversation.id);
    messageElements = [];
    chatbox.innerHTML = "";
    await renderMessages(messageObjects)
        .then(() => {
            return true;
        });
}

async function renderMessages() {
    for(let i = 0; i < messageObjects.length; i++) {
        if (i !== 0) {
            if (messageObjects[i].role !== "system") {
                activeMessage = new Message(messageObjects[i].role);
                activeMessage.pushText(messageObjects[i].content);
            }
            else {
                let output = JSON.parse(messageObjects[i].content);
                activeMessage.createPyout();
                if (output.data !== undefined) {
                    activeMessage.pushResult((output.data).replaceAll('\\n', '\n'));
                }
                if (output.error !== undefined) {
                    activeMessage.pushError(output.error);
                }
                activeMessage.setCode(output.code);
            }
            updateScroll();
            activeMessage.outlineShape = '#ffffff00';
            messageElements.push(activeMessage);
        }
    }
}

async function messageOpacity(container, messages) {
    let containerHeight = container.clientHeight;
    let containerTop = container.scrollTop;

    messages.forEach(message => {
        let messageTop = message.offsetTop - containerTop;
        let messageHeight = message.clientHeight;

        let opacity = 1;

        if (messageTop + messageHeight < 0 || messageTop > containerHeight) {
            opacity = 0;
        }

        else if (messageTop < 50)
        {
            opacity = messageTop / 50;
        }

        else if (messageTop + messageHeight > containerHeight - 50)
        {
            opacity = (containerHeight - (messageTop + messageHeight) / 50);
        }

        this.style.opacity = `${opacity}`;
    })
}

function updateScroll(force = false, behaviour = 'smooth')
{
    if (!force) {
        if (chatbox.scrollHeight <= (chatbox.scrollTop + chatbox.offsetHeight*2)) {
            chatbox.scrollTo({
                top: chatbox.scrollHeight,
                behavior: behaviour
            });
        }
    }
    else
    {
        chatbox.scrollTo({
            top: chatbox.scrollHeight,
            behavior: behaviour
        });
    }
}