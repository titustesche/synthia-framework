# Synthia Framework
## Before we begin
This application is in the earliest of its stages.
I have worked on this for a long time, and a lot has happened since I started.
But this project is still light-years away from being finished, and with the current rate of change in the
(OpenSource) AI Industry, it will be in this state for a long time.

This is the first (kind of) working prototype of this project.
And to be honest, it's pretty neat.

~~It can do everything your typical LLM can (as long as you use a suitable model).
But aside from that, it can read and write to your files,
write short programs that will be executed in realtime or open a website.
This Feature is even better on Linux, since it cannot just simply open websites
but every program that is accessible from the shell (so pretty much everything).~~

The scripting feature is currently a work in progress again and cannot be used in this version of the framework - it's a bummer, I know

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
that it didn't nuke my entire filesystem yet (Yes, it tried once).

Aside from these somewhat clear goals,
I will also test this program with different AI models to find the most optimal one for this rather niche Application.
So far I've tested llama3.1:7b, qwen2.5-coder:14b and deepseek-r1:14b each with their own bag strengths and weaknesses.

Update on the Models:
The current "very supported" model is qwen2.5-coder:14b, as it is way better at following instructions and doesn't mess up
code nearly as often as Llama. It can also deal with much more complicated Coding tasks to begin with.
I will eventually use even bigger models when AMD finally releases RDNA4

I think another big problem is the initial prompt, since I have absolutely no idea how to prompt an LLM the right way.

If you are a developer yourself and want to modify it for your own use case,
I highly encourage you to read the [Documentation](Documentation/Documentation%20-%20Welcome.md)!
Also feel free to let me know what you use this for,
I am quite interested in what other use cases people can come up with.

And now, enjoy getting this mess to work :)

## 1 Description
This Repository provides a backend to interact with an LLM.
It enables the LLM to write python scripts that can be executed,
allowing better integration with the own PC if hosted there.

## 2 Installation
### 2.1 If you have Ollama and Node installed
Install all the dependencies of the Project using `npm i` while inside the `/src` folder.
Run `index.ts` with `node --require ts-node/register index.ts`.

**Note:** `ts-node` has to be installed globally.

The console output should look like this:
> $ node --require ts-node/register index.ts <br/>
> Data source initialized <br/>
> App listening on 3000

If this is the case, you can either use the official [Synthia Frontend](https://github.com/titustesche/synthia-frontend) or write your own. If you decide to write your own frontend,
consider reading the Documentation for better understanding of the API. 
Note that  ollama has to be running in order to chat with the AI.

### 2.2 Setting up mariadb
To use this Application, you need to have mariadb installed and set up a user account for the backend to use.
Alternatively, you can change the user and database credentials in `/src/database/data-source.ts`.
Once you've followed steps [2.2.1](#221-the-database) and [2.2.2](#222-account),
the program will manage the database on its own.

#### 2.2.1 The Database
By default, you will need a Database called `synthia_framework`, once the backend is able to successfully connect the database,
it will automatically set it up.

#### 2.2.2 Account
By default, this program uses its user account to access the database.
If you wish to keep the default configuration, create a user named `synthia_framework`,
give it full access to the `synthia_framework` database and set its password to `1234`.

Regardless of whether you are using a custom account or not, the selected account needs full read and write
access to the `synthia_framework` database.

### 2.3 If you don't have Ollama and Node installed
Since this program has been developed entirely on Linux,
it's all you will get for now.

#### 2.3.1 Linux
Install Node and Ollama using your package manager (eg: `sudo dnf install ollama node`).
When the installation is finished, pick a model from the [Ollama Library](https://ollama.com/library)
or create your own model using Ollama.
After that, follow the steps described in 2.1 and 2.2 to set up your environment.

#### 2.3.2 *Windows
I will eventually try to set everything up on Windows and post detailed descriptions here,
but for now that is at the very bottom of my priority list as the program itself will still change drastically.

#### 2.3.3 *Mac
Nope, unless you figure it out yourself.

*Some functionality is heavily impacted by these Operating Systems