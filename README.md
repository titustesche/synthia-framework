# Synthia
## Before we begin
This application is in the earliest of its stages.
I have worked on this for a long time, and a lot has happened since I started.
But this project is still light-years away from being finished, and with the current rate of change in the
(OpenSource) AI Industry, it will be in this state for a long time.

This is the first (kind of) working prototype of this project.
And to be honest, it's pretty neat.
It can do everything your typical LLM can (as long as you use a suitable model).
But aside from that, it can read and write to your files,
write short programs that will be executed in realtime or open a website.
This Feature is even better on Linux, since it cannot just simply open websites
but every program that is accessible from the shell (so pretty much everything).

You will see Linux mentioned a lot in this, but that's for a reason.
And no, I don't use Arch btw (but I used to).
This is simply because this program has been developed entirely on Linux,
and some (if not the greatest) of its Features depend heavily on the power of the linux shell.
I guess you can emulate similar behavior on Windows and maybe even macOS,
but I think not to this extend.

Maybe (MAYBE!) I will set myself down to create my own scripting language for the AI to use,
which will be shipped with a custom interpreter like Python, but this thought reaches far into the future.

As for now, my main goals are to finish some features I've been working on for quite some time now,
(Spoiler: Yes, there are many yet unused code sections, but they exist for future use — mostly...)
as well as reworking this nightmare of a realtime code detector.
I have also applied for a Google Home API key, just to see if this can turn my lights on and off.
However, this will be of no real use and is potentially even dangerous
if your smart-home Installation contains more than just lights.
Actually, this entire project is pretty dangerous, and I am actually kind of surprised
that it didn't nuke my entire filesystem yet (Yes, it tried once after shutting down my PC).

Aside from these somewhat clear goals,
I will also test this program with different AI models to find the most optimal one for this rather niche Application.
So far I've been using llama3.1:7b but since then my hardware has improved, so I will be testing with larger models
from now on.
I think another big problem is the initial prompt, since I have absolutely no idea how to prompt an LLM the right way.

And now, enjoy getting this to work :)

## 1 Description
This Repository provides a backend, as well as the according frontend to interact with an LLM.
It enables the LLM to write python scripts that can be executed by the backend,
allowing better integration with the own PC if hosted there.

## 2 Installation
### 2.1 If you have Ollama and Node installed
Change your preferred model in `/frontend/includes/main.inc.js, Line 107`.
In case that you have configured `ollama` to use another port than the default one,
change that too in Line 105. After that,
install the dependencies of the Project using `npm i` while inside the `/src` folder.

Finally, you can run `index.ts` with `node --require ts-node/register index.ts`.
The console should look like this:
> $ node --require ts-node/register index.ts <br/>
> Data source initialized <br/>
> App listening on 3000

If this is the case, you can open `index.html` in a browser of your choice (tested with Firefox) and start chatting.
Note that both the backend Server and ollama have to be running to gain full functionality.
Alternatively, you can use just the frontend located in the `/frontend` directory
to purely interact with ollama without script execution.
Note that the frontend will try to send everything typed between { } to the backend.
This will be fixed in a future update when I finally decide to rework the entire
command detection system to finally take Database calls into account.

### 2.2 Setting up mariadb
To use this Application, you need to have mariadb installed and set up a user account for the backend to use.
Alternatively, you can change the user and database credentials in `/src/database/data-source.ts`.
Once you've followed steps [2.2.1](#221-the-database) and [2.2.2](#222-account),
the program will manage the database on its own.

#### 2.2.1 The Database
By default, you will need a Database called `ai_memory`, once the backend is able to successfully connect the database,
it will automatically set it up.

#### 2.2.2 Account
By default, this program uses its user account to access the database.
If you wish to keep the default configuration, create a user named `ai_memory`,
give it full access to the `ai_memory` database and set its password to `1234`.

Regardless of whether you are using a custom account or not, the selected account needs full read and write
access to the `ai_memory` database.

### 2.3 If you don't have Ollama and Node installed
Since this program has been developed entirely on Linux,
I will only include instructions for the most common Linux distros.

#### 2.3.1 Fedora
Install Node and Ollama using `sudo dnf install ollama node`.
When the installation is finished, pick a model from the [Ollama Library](https://ollama.com/library)
and follow the instructions on the site to download it.
After that, follow the steps described in 2.1 to set up your environment.

#### 2.3.2 Ubuntu
Install Node and Ollama using `sudo apt-get install ollama node`.
When the installation is finished, pick a model from the [Ollama Library](https://ollama.com/library)
and follow the instructions on the site to download it.
After that, follow the steps described in 2.1 to set up your environment.

#### 2.3.3 Windows
I will eventually try to set everything up on Windows and post detailed descriptions here,
but for now that is at the very bottom of my priority list as the program itself will still change drastically.

#### 2.3.4 Mac
Nope, unless you figure it out yourself.