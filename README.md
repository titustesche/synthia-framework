# Synthia Framework
## Before we begin
This application is still in a very early stage of development.
I have worked on this for almost over a year now, and it has come very far.
But this project is still light-years away from being finished, and with the current rate of change in the
open-source AI Industry, it will remain in this state for a long time.

You will see Linux mentioned a lot in this, but that's for a reason (I use Arch btw).
This is simply because this program has been developed entirely on Linux,
and some (if not the greatest) of its features depend heavily on the power of the linux shell.
I guess you can emulate similar behavior on Windows and macOS, and I plan on creating a custom scripting language
to make actions truly OS independent, but that's way ahead of schedule as of now.

As for now, my main goals are to finish some features I've been working on for quite some time now,
(Spoiler: Yes, there are many yet unused code sections, but they exist for future use — mostly...)
I have also applied for a Google Home API key, just to see if this can turn my lights on and off.
However, this will be of no real use and is potentially even dangerous
if your smart-home installation contains more than just lights.
Actually, this entire project is one heck of a security concern, and I am actually kind of surprised
that it didn't nuke my entire filesystem yet (It tried once).

The current "very supported" model is any GPT-OSS, since it has excellent performance in both coding and not
overthinking stuff, which was a big issue with the other models.

If you are a developer yourself and want to modify it for your own use case,
I highly encourage you to read the [Documentation](Documentation/Documentation%20-%20Welcome.md)!
Also feel free to let me know what you use this for,
I am quite interested in what other use cases people can come up with.

And now, enjoy getting this mess to work :)

## 1 Description
This repository provides a backend to interact with an LLM.
It enables the LLM to write python (more coming soon) scripts that can be executed in real-time,
allowing better integration with the local machine if hosted there.

## 2 Installation
### 2.1 If you have Ollama and Node installed
Install all the dependencies of the project using `npm i` while inside the `/src` folder.
Run `index.ts` with `node --require ts-node/register index.ts`.

**Note:** `ts-node` has to be installed globally.

The console output should look like this:
> $ node --require ts-node/register index.ts <br/>
> Data source initialized <br/>
> App listening on 3000

If this is the case, you can either use the official [Synthia Frontend](https://github.com/titustesche/synthia-frontend) or write your own. If you decide to write your own frontend,
consider reading the Documentation for better understanding of the API. 
Note that ollama has to be running to chat with the AI.

### 2.2 Setting up mariadb
To use this application, you need to have mariadb installed and set up a user account for the backend to use.
Alternatively, you can change the user and database credentials in `/src/database/data-source.ts`.
Once you've followed steps [2.2.1](#221-the-database) and [2.2.2](#222-account),
the program will manage the database on its own.

#### 2.2.1 The Database
By default, you will need a database called `synthia_framework`,
once the backend is able to successfully connect to the database,
it will automatically set it up.

#### 2.2.2 Account
By default, this program uses its user account to access the database.
If you wish to keep the default configuration, create a user named `synthia_framework`,
give it full access to the `synthia_framework` database and set its password to `1234`.

Regardless of whether you are using a custom account or not, the selected account needs full read and write
access to the `synthia_framework` database.

### 2.3 If you don't have Ollama and Node installed
Since this program has been developed and tested on Linux,
these are the only installation instructions I can provide so far.

#### 2.3.1 Linux
Install Node and Ollama using your package manager (eg: `sudo dnf install ollama node`).
Once the installation is finished, pick a model from the [Ollama Library](https://ollama.com/library)
or create your own model using Ollama.
After that, follow the steps described in 2.1 and 2.2 to set up your environment.

#### 2.3.2 *Windows
I will eventually try to set everything up on Windows and post detailed descriptions here,
but for now that is at the very bottom of my priority list as the program itself will still change drastically.

#### 2.3.3 *Mac
Nope, unless you figure it out yourself.

#### 2.3.4 Docker
The latest Version supports a docker image, which is now the default way of setting things up.
To set up the docker containers, create an image from this repo. After that, setup another container for mariadb and name it
(default is synthia_database and can be changed in `src/database/data-source.ts`). The setup should be the same as described in 2.2.1
Next, create a network and connect both containers to this network. Finally, you can run both containers.

*Some functionality is heavily impacted by these Operating Systems