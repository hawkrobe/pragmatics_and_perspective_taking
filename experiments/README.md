There are two versions of the experiments: `cogsci` contains the pilot experiments reported in our 2015 cogsci conference paper, and `final` contains the final experiments reported in our journal manuscript.

To run these experiments on your machine, follow the instructions below:

1. navigate to the location where you want to create your project, and enter 
   ```
   git clone https://github.com/hawkrobe/keysar_replication.git
   ```
   at the command line to create a local copy of this repository. On Windows, run this command in the shell.

2. Install node and npm (the node package manager) on your machine. Node.js sponsors an [official download](http://nodejs.org/download/) for all systems. For an advanced installation, there are good instructions [here](https://gist.github.com/isaacs/579814).

3. Navigate into the experiment directory (e.g. `./experiments/final/`). You should see a file called package.json, which contains the dependencies. To install these dependencies, enter ```npm install``` at the command line. This may take a few minutes.

4. Finally, to run the experiment, enter ```node app.js experiment1``` or ```node app.js experiment2``` at the command line. You should expect to see the following message:
   ```
   info  - socket.io started
       :: Express :: Listening on port 8888
   ```
   This means that you've successfully created a 'server' that can be accessed by copying and pasting 
   ```
   http://localhost:8888/index.html
   ```
   in one tab of your browser. You should see a waiting room. To connect the other player in another tab for test purposes, open a new tab and use the same URL. 
