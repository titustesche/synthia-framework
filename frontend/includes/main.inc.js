let messages;


window.onload = function() {
    messages = [];
}

function sendRequest() {
    const chatbox = document.getElementById('chatbox');
    const prompt = document.getElementById("query").value;
    let ai_message = "";
    messages.push({"role": "user", "content": prompt});
    chatbox.innerHTML += "<p class='message' id='user'>" + prompt + "</p>" + "<p class='message' id='ai'>";
    let url = "http://localhost:11434/api/generate";
    const data = {
        "model": "llama3",
        "messages": [
            {
                "role": "user",
                "content": "why is the sky blue?"
            },
            {
                "role": "assistant",
                "content": "due to rayleigh scattering."
            },
            {
                "role": "user",
                "content": "how is that different than mie scattering?"
            }
        ]
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
                            chatbox.innerHTML += json.response;
                            ai_message += json.response;
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
            console.log("Result:" + result);
            messages.push({"role": "assistant", "content": ai_message});
        });
}