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
    object;
    pyout;
    pyoutResult;
    pyoutCode;
    pyoutHeader;
    
    constructor (role) {
        this.object = chatbox.appendChild(document.createElement("div"));
        this.object.className = `msg_${role}`;

        chatbox.scrollTop = chatbox.scrollHeight;
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
        
        chatbox.scrollTop = chatbox.scrollHeight;
    }
    
    pushResult(result) {
        this.pyoutResult.innerHTML += result;
        this.pyoutResult.scrollTop = this.pyoutResult.scrollHeight;
    }
    
    pushError(error) {
        this.pyoutResult.innerHTML += `<span style="color: #ff6f6f">${error}</span>`;
        this.pyout.scrollTop = this.pyout.scrollHeight;
        chatbox.scrollTop = chatbox.scrollHeight;
    }
    
    setCode(code) {
        this.pyoutCode.innerHTML = `Status: ${code}`;
        switch (code) {
            case 1:
                this.pyoutCode.style.backgroundColor = '#af0000';
                cssRoot.style.setProperty("--outline-color", '#ff0000');
                this.pyoutResult.setAttribute("textCursor", "false");
                break;
            
            case 0:
                this.pyoutCode.style.backgroundColor = '#005900';
                cssRoot.style.setProperty("--outline-color", '#00ff00');
                this.pyoutResult.setAttribute("textCursor", "false");
                break;
                
            case "Running":
                this.pyoutCode.style.backgroundColor = '#a15b00';
                cssRoot.style.setProperty("--outline-color", '#d89716');
                break;
                
            case "Writing":
                this.pyoutCode.style.backgroundColor = '#001ba3';
                cssRoot.style.setProperty("--outline-color", '#0033ff');
                break;
        }
    }
    
    pushText(text) {
        this.object.innerHTML += text;
    }
    
    setOutlineColor(color) {
        cssRoot.style.setProperty("--outline-color", color);
    }
}

async function updateMessages() {
    messageObjects = await getMessages(activeConversation.id);
    messageElements = [];
    chatbox.innerHTML = "";
    await renderMessages(messageObjects);
}

async function renderMessages() {
    console.log(`Called for messages rendering, messages length: ${messageObjects.length}`);
    for(let i = 0; i < messageObjects.length; i++) {
        if (i !== 0) {
            if (messageObjects[i].role !== "system") {
                activeMessage = new Message(messageObjects[i].role);
                activeMessage.pushText(messageObjects[i].content);
            }
            else {
                console.log(messageObjects[i]);
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
            chatbox.scrollTop = chatbox.scrollHeight;
            activeMessage.setOutlineColor('transparent');
        }
    }
}