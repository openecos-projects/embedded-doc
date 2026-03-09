# Environment Preparation

## Step1 Install the WSL Subsystem

### 1. Enable Developer Mode

* Find the Windows Update settings in the Settings menu.

<img src="../../../res/img/sdk/env/env_windows_setting.png" alt="1" style="zoom:80%;" />

* Find the "For developers" settings, then turn on "Developer Mode".

<img src="../../../res/img/sdk/env/env_windows_setting1.png" alt="2" style="zoom:80%;" />

### 2. Enable the Windows Subsystem for Linux.

* Open the Control Panel, then find "Programs and Features".

<img src="../../../res/img/sdk/env/enable Linux1.png" alt="3" style="zoom:80%;" />

* Click on "Turn Windows features on or off".

<img src="../../../res/img/sdk/env/enable Linux2.png" alt="4" style="zoom:80%;" />

* Scroll down, check the "Windows Subsystem for Linux" option, and restart your computer immediately after making the change。

<img src="../../../res/img/sdk/env/enable Linux3.png" alt="5" style="zoom:80%;" />

<img src="../../../res/img/sdk/env/enable Linux4.png" alt="6" style="zoom: 67%;" />

### 3. Install the Linux Subsystem.

* Search for "Ubuntu" in the Microsoft Store.

<img src="../../../res/img/sdk/env/install Linux1.png" alt="7" style="zoom: 67%;" />

* Install and launch Ubuntu 24.04.1.

<img src="../../../res/img/sdk/env/install Linux2.png" alt="8" style="zoom:67%;" />

* After launching, create an account and enter a username. Note that the username cannot contain uppercase letters.

<img src="../../../res/img/sdk/env/install Linux3.png" alt="8" style="zoom:67%;" />

* Set the account password. Note that in Linux, there are no asterisk (*) prompts when typing the password; just type it blindly and confirm it.

<img src="../../../res/img/sdk/env/enable Linux4.png" alt="10" style="zoom:80%;" />



## Step2 SDK Installation
### 1. Install Git on Ubuntu.

Before officially installing the SDK, you need to install Git on Ubuntu and connect it to the GitHub repository. Enter the following command in Ubuntu to install Git:

```
sudo apt update && sudo apt upgrade -y
sudo apt install git -y
```

* Next, configure Git to connect to GitHub. First, set up your Git username and email by replacing "Your Name" and "your_email@example.com" in the following code with your own GitHub username and email:

```
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

* Generate an SSH key by running the following command (if you have no special requirements, you can simply press Enter to use the default location ~/.ssh/id_rsa). If the system prompts you to enter a passphrase, you can either set one to protect the key or press Enter to skip it:

```
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

When the following page content appears, the SSH key has been successfully generated.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu1.png" alt="1" style="zoom:80%;" />

* Add the SSH key to the SSH agent:

```
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

* Add the public key to the SSH keys list on GitHub:

 	Retrieve your SSH public key by running the following code, and copy all of the output content.

```
cat ~/.ssh/id_rsa.pub
```

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu2.png" alt="2" style="zoom:80%;" />

​	Log in to your GitHub account, then go to Settings > SSH and GPG keys > New SSH key.

​	Paste the public key into the Key field, provide a title, and then click Add SSH key.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu3.png" alt="3" style="zoom: 67%;" />

* Test the connection by entering the following command to confirm if the configuration was successful.

```
ssh -T git@github.com
```

​	If the following message appears, the connection is successful.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu4.png" alt="3" style="zoom: 67%;" />

* Once Git and the SSH connection are configured, you can start cloning the repository from GitHub.

```
git clone git@github.com:username/repository.git
```

​	Replace username/repository.git with the path of the GitHub repository you want to clone. In this case, our repository address is openecos-projects/embedded-sdk.git。

​	Once the following interface appears, you have successfully completed all the steps for configuring Git to connect to GitHub on Ubuntu 24.04.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu5.png" alt="3" style="zoom: 67%;" />

### 2. begin the SDK installation.

* In Ubuntu, enter the following commands to navigate to the folder and add execution permissions to the installation script.

```
cd embedded-sdk
chmod +x install.sh
./install.sh
```

The following error occurs because the Ubuntu system is too "clean" and lacks the basic tools (compiler and decompression tools) required for compiling code.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu6.png" alt="6" style="zoom:80%;" />

Enter the following command. Note that when executing a sudo command, you will be prompted for a password. No characters will be displayed on the screen while typing; just press Enter after typing it.

```
sudo apt-get update
sudo apt-get install gcc make unzip -y
```

* After installing the above components, run the installation script again:

```
./install.sh
```

When the following interface appears, you can proceed to the next step.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu7.png" alt="7" style="zoom: 80%;" />

* Run the following command to update the environment variables.

```
source ~/.bashrc
```
## 
## Step3 Connect Ubuntu with VS Code

Connecting Ubuntu within VS Code allows you to transition from the "painful black window" to a "comfortable graphical interface."

### 1. Download the Remote Explorer and WSL extensions.

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code1.png" alt="1" style="zoom:80%;" />

Click the blue icon in the bottom-left corner of VS Code (the small square composed of two arrows). 

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code2.png" alt="2" style="zoom:80%;" />

In the menu that appears at the top, select "Connect to WSL".

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code3.png" alt="3" style="zoom:80%;" />

The system will automatically establish the connection. Once connected successfully, the blue area in the bottom-left corner of VS Code will display "WSL: Ubuntu-24.04".

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code4.png" alt="4"  />

### 2. Configure the VS Code workspace path.

* Click the first icon in the left sidebar of VS Code (Explorer / File Explorer).

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code5.png" alt="5" style="zoom:80%;" />

* Click "Open Folder"

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code6.png" alt="6" style="zoom:80%;" />

* In the input box that appears in the center, you will see the path /home/happy/. Please click or enter: /home/happy. The left-hand list in VS Code will then display your project structure. main.c is where we will write the code next, and the build/ folder contains the compiled .bin files.

* In VS Code, press the shortcut Ctrl + ~ to open the integrated terminal, which will already be automatically located in the hello folder. Here, you can enter make to compile directly, without needing to switch back to the Ubuntu window.
