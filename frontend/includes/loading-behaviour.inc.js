let reader = new FileReader();
let chatbox;
let query;
let messageObjects;
let systemMessage = {
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
        "Also note that tkinter is already imported as tk" +
        "When writing a script, it should always be the very last thing in your message." +
        "Write any explaination or other text before you send the script." +
        "You should also never assume the result of those script or tell the user any debug messages unless he specifically asks for it"
};
let messageElements = [];
let cssRoot;
let activeMessage;
let activeConversation;

window.onload = async function() {
    // The functionality part
    chatbox = document.getElementById('chatbox');
    cssRoot = document.querySelector(':root');

    let conversations = await generateConversations();
    
    conversations.forEach(conversation => {
        conversation.render(document.getElementById("sidebar-wrapper"));
        conversation.object.addEventListener('click', async function() {
            conversations.forEach( c => { c.object.setAttribute("active", "false") });
            activeConversation = conversation;
            conversation.object.setAttribute("active", "true");
            await updateMessages();
        });
    })

    activeConversation = conversations[0];
    activeConversation.object.setAttribute("active", "true");
    await updateMessages();

    query = document.getElementById('query');
    query.addEventListener('keydown', function(e) {
        if (e.code === 'Enter' && !e.shiftKey)
        {
            e.preventDefault();
            sendRequest();
            this.style.height = 'auto';
            this.style.height = `min(${this.scrollHeight}px, 100px)`;
        }
    });

    query.addEventListener('input', function(e) {
        this.style.height = 'auto';
        this.style.height = `min(${this.scrollHeight}px, 100px)`;
    });

    // The styling part
    // Todo:
    //      Apply this effect to messages when the ai is typing to indicate activity
    //      Maybe another color when generating python scripts?
    
    document.getElementsByTagName('body')[0].addEventListener('mousemove', function (e) {
        /*
        messageObjects.forEach(message => {
            drawMouseHighlight(message.object, e.pageX, e.pageY, "rgba(0, 255, 255, 1)");
        });
        drawMouseHighlight(document.getElementById('glassWrapper'), e.pageX, e.pageY, "rgba(0,255,221,0.63)");
        drawMouseHighlight(document.getElementById('sidebar-wrapper'), e.pageX, e.pageY, "rgba(0,101,255,0.63)");
         */
    });
}

function drawMouseHighlight(element, x, y, color) {
    let width = element.offsetWidth;
    let height = element.offsetHeight;
    let posX = element.offsetLeft;
    let posY = element.offsetTop;
    
    let highlightX = (x - posX) / width * 100;
    let highlightY = (y - posY) / height * 100;
    
    element.style.backgroundImage = `radial-gradient(circle farthest-corner at ${highlightX}% ${highlightY}%, ${color} 5px, #FFFFFFFF 50px)`;
}