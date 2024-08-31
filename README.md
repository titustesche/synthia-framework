# Introduction
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

### 2.2 If you don't have Ollama and Node installed
Since this program has been developed entirely on Linux,
I will only include instructions for the most common Linux distros.

#### 2.2.1 Fedora
Install Node and Ollama using `sudo dnf install ollama node`.
When the installation is finished, pick a model from the [Ollama Library](https://ollama.com/library)
and follow the instructions on the site to download it.
After that, follow the steps described in 2.1 to set up your environment.

#### 2.2.2 Ubuntu
Install Node and Ollama using `sudo apt-get install ollama node`.
When the installation is finished, pick a model from the [Ollama Library](https://ollama.com/library)
and follow the instructions on the site to download it.
After that, follow the steps described in 2.1 to set up your environment.

#### 2.2.3 Windows
I will eventually try to set everything up on Windows and post detailed descriptions here,
but for now that is at the very bottom of my priority list as the program itself will still change drastically.

#### 2.2.4 Mac
Nope, unless you figure it out yourself.