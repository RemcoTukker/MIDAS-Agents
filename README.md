# MIDAS-Agents

This is the agent and learning code for MIDAS, running in NodeJS and talking to the MIDAS ESB Service agent over HTTP (connection is managed by the esb proxy agent). We're using an Express server for serving some UIs.

Note that this relies on eve-nodejs, which is currently linked in with npm-link and maintained on a separate repo.



## Deployment on ARUM CentOS Image

Install the required external software, git, nodejs and omniorb:

	su
	rpm --import https://fedoraproject.org/static/0608B895.txt
	rpm -Uvh http://download-i2.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
	yum install nodejs npm --enablerepo=epel
	yum install omniORB omniORB-devel --enablerepo=epely
	yum install git
	exit

Download and install the tools for building the learning modules

	mkdir ~/MIDASdeployment
	cd ~/MIDASdeployment
	git clone --recursive https://github.com/dobots/aim.git
	cd aim
	make aimtools rur-builder
	su
	make aimtools.install rur-builder.install
	exit
	mkdir ~/MIDASdeployment/aim_workspace
	export AIM_WORKSPACE=$HOME/MIDASdeployment/aim_workspace
	echo "export AIM_WORKSPACE=$AIM_WORKSPACE" >> $HOME/.bashrc

Download MIDAS learning modules

	aimget learningModules https://github.com/RemcoTukker/MIDAS-Learning-Modules
	cd $AIM_WORKSPACE/learningModules
	aimselect MeanAndVarianceModule nodejs
	aimmake MeanAndVarianceModule

Install MIDAS agents

	cd ~/MIDASdeployment
	git clone https://github.com/RemcoTukker/eve-nodejs-remco.git
	cd eve-nodejs-remco
	npm install
	su
	npm link
	exit
	cd ~/MIDASdeployment
	git clone https://github.com/RemcoTukker/MIDAS-Agents
	cd MIDAS-Agents
	npm install
	npm link eve-nodejs

Deploying learning modules to MIDAS agents (will make a script for this later)

	cp -r ~/MIDASdeployment/aim_workspace/learningModules/MeanAndVarianceModule/builds/nodejs/Release/obj.target/* ~/MIDASdeployment/MIDAS-agents/learningmodules

## Deployment to Ubuntu/Debian

Do the same as on CentOS, but:
- Use sudo instead of the horrible su / exit
- Replace yum by apt-get
- Replace omniORB by omniidl (no devel packages needed)

## Enjoy!

	cd ~/MIDASdeployment/MIDAS-agents
	node MIDAS-agents.js

Open browser and go to [http://localhost:3000/](http://localhost:3000/) for a demo of MIDAS agents learning their job length. As soon as the ESB service is available, they will learn this from ESB events.

## So, where's the link with the ESB?

The ESB service that connects to the MIDAS agents (over http using JSON RPC) still needs some polishing, will be released soon as well :-)
