// Global Variables
let reader = new FileReader();
// HTML Elements that need to be global
let chatbox;
let query;
let messageObjects; // Todo: This does not need to be global -_-

// Conversation configuration -> Todo: Let Users edit this
let assistantName = "Synthia";
let userName = "Titus";
let systemMessage = {
    "role": "system",
    "content":
        "You have the ability to send Python code to a backend server to execute specific tasks." +
        "For simple queries or basic information, you can provide direct answers without needing a script." +
        "If there's a need for executing a complex task, write a script surrounded by {} and separate individual lines with \n." +
        "For example: {line1\nline2\nline3}. You can use as many lines as needed." +
        "The os, webbrowser, random, time and tkinter (as tk) modules are already imported and can be used." +
        "You are not allowed to use any further import statements in your scripts!" +
        "The system that executes these commands is Fedora Linux, you should never use sudo." +
        "Try to only use direct console commands through the os library, preferably systemctl or loginctl for session management." +
        "These Scripts should always be the first thing in your response, make them as short and simple as possible." +
        "NEVER use a script to solve a request that can be completed with language like math operations or texts." +
        "Everything file related should happen in the folder /home/titus and one of its subfolders like" +
        "Bilder, Desktop or Downloads. The Desktop Environment at use is KDE Plasma." +
        "Do not overengineer any command, just use the most simple, straight forward solution there is for anything," +
        "remember that you can only use python and the two imported libraries" +
        "You are allowed to make a maximum of 1 requests at a time." +
        "Every time a script is executed, the system will provide you with the output of that script." +
        "This output will be accessible with the first message after the request has been sent." +
        "After receiving this output, determine if the execution was successful and report back to the user" +
        "When creating a tkinter instance, the window has to be initialized with root = tk.Tk()." +
        "When writing a script, it should always be the very last thing in your message."
};

// Important global variables for Runtime - Representations, not real HTML Elements
let messageElements = [];
let cssRoot;
let activeMessage;
let activeConversation;

// Shit that needs to be done when the site is first loaded
window.onload = async function() {
    // Assign important Elements
    chatbox = document.getElementById('chatbox');
    cssRoot = document.documentElement;

    // Custom Method, returns all conversations as an array
    let conversations = await generateConversations();

    // Render the Conversations
    await conversations.forEach(conversation => {
        conversation.render(document.getElementById("sidebar-wrapper"));

        // Make the conversations clickable
        conversation.object.addEventListener('click', async function() {
            // Removes the active Indicator of every conversation when one is clicked
            conversations.forEach( c => { c.object.setAttribute("active", "false") });
            activeConversation = conversation;
            conversation.object.setAttribute("active", "true");
            await updateMessages(activeConversation);
            // Custom Method, scrolls down, takes force and behavior as inputs
            updateScroll(true, 'instant');
        });
    })

    // Set the active Conversation, default is first in array
    // Todo: Use GET Parameters to determine conversation, maybe by fetching database IDs
    activeConversation = conversations[0];
    activeConversation.object.setAttribute("active", "true");

    // Loads all the Messages of the selected Conversion into memory
    await updateMessages();
    updateScroll(true, 'instant');

    // Set behavior of the query box
    query = document.getElementById('query');
    query.addEventListener('keydown', function(e) {
        // Detect if Enter is pressed and Shift isn't
        if (e.code === 'Enter' && !e.shiftKey)
        {
            // Suppress default behavior
            e.preventDefault();
            // Custom Function, sends a request to the specified backend Server
            sendRequest();
            // Reset size, works half of the time
            this.style.height = 'auto';
            this.style.height = `min(${this.scrollHeight}px, 100px)`;
            return false;
        }
    });

    // Makes it scroll automatically
    query.addEventListener('input', function(e) {
        this.style.height = 'auto';
        this.style.height = `min(${this.scrollHeight}px, 100px)`;
    });

    // The styling part
    // Todo:
    //      Apply this effect to messages when the ai is typing to indicate activity
    //      Maybe another color when generating python scripts?

    // Unused as of now.
    // Was intended to change the message opacity when they get out of sight
    // I will probably revisit this so it stays as a comment
    /*
    chatbox.addEventListener('scroll', async function() {
        await messageOpacity(this, document.querySelectorAll('.msg_user'));
    })
    */

    // Way too resource intensive for making text look a fancy, but I like it
    // Also it's fully customizable for every text Element
    document.getElementsByTagName('body')[0].addEventListener('mousemove', function (e) {
        // Read the default text color to use it as "Background"
        let textColor = getComputedStyle(cssRoot).getPropertyValue('--text-color');
        
        // Apply Effect to messages and Conversations
        messageElements.forEach(messageElement => {
            if (messageElement.role === "assistant") {
                drawMouseHighlight(messageElement.body, e.pageX, e.pageY, "rgb(136,255,255)", "white", 150);
                // Optional Mouse highlight for Assistant header, looks better without it
                // drawMouseHighlight(messageElement.header, e.pageX, e.pageY, '#25d80a', "#0a5fd8", 150);
            }

            else {
                drawMouseHighlight(messageElement.body, e.pageX, e.pageY, "rgb(150,202,107)", "white", 150);
                // Optional Mouse highlight for User header, looks better without it
                // drawMouseHighlight(messageElement.header, e.pageX, e.pageY, '#0a5fd8', "#25d80a", 100);
            }
        });
        conversations.forEach(conversation => {
            drawMouseHighlight(conversation.object, e.pageX, e.pageY, "rgba(110,20,205,0.5)", textColor, 60);
        });
        
        // Can be uncommented to apply to other elements as well, but I like it subtle
        // drawMouseHighlight(document.getElementById('glassWrapper'), e.pageX, e.pageY, "rgba(0,255,221,0.63)");
        // drawMouseHighlight(document.getElementById('sidebar-wrapper'), e.pageX, e.pageY, "rgba(0,101,255,0.63)");
    });
}