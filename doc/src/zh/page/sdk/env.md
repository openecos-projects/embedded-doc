# 环境准备
# Environment Preparation
## Step1 安装WSL子系统
## Step1 Install the WSL Subsystem

### 1. 启用开发者模式

Enable Developer Mode

（1）在设置中查找Windows更新设置

Find the Windows Update settings in the Settings menu.

<img src="../../../res/img/sdk/env/env_windows_setting.png" alt="1" style="zoom:80%;" />

（2）找到开发者选项，开启“开发人员模式”

Find the "For developers" settings, then turn on "Developer Mode".

<img src="../../../res/img/sdk/env/env_windows_setting1.png" alt="2" style="zoom:80%;" />
### 2. 启用Linux子系统

Enable the Windows Subsystem for Linux.

（1）打开控制面板，找到"程序与功能"

Open the Control Panel, then find "Programs and Features".

<img src="../../../res/img/sdk/env/enable Linux1.png" alt="3" style="zoom:80%;" />

（2）点击“启用或关闭Windows功能”

Click on "Turn Windows features on or off".

<img src="../../../res/img/sdk/env/enable Linux2.png" alt="4" style="zoom:80%;" />

（3）往下滑勾选“适用于Linux的Windows”子系统选项，更改完立即**<font>重启电脑</font>**。

Scroll down, check the "Windows Subsystem for Linux" option, and restart your computer immediately after making the change。

<img src="../../../res/img/sdk/env/enable Linux3.png" alt="5" style="zoom:80%;" />

<img src="../../../res/img/sdk/env/enable Linux4.png" alt="6" style="zoom: 67%;" />
### 3. 安装Linux子系统

Install the Linux Subsystem.

（1）在Microsoft Store中搜索“ubuntu”

Search for "Ubuntu" in the Microsoft Store.

<img src="../../../res/img/sdk/env/install Linux1.png" alt="7" style="zoom: 67%;" />

（2）安装并启动Ubuntu 24.04.1

Install and launch Ubuntu 24.04.1.

<img src="../../../res/img/sdk/env/install Linux2.png" alt="8" style="zoom:67%;" />

（3）启动后创建账号，填写用户名，注意用户名**<font>不能有大写字母</font>**。

After launching, create an account and enter a username. Note that the username cannot contain uppercase letters.

<img src="../../../res/img/sdk/env/install Linux3.png" alt="8" style="zoom:67%;" />

（4）设账号密码，Linux的密码输入没有*号提示，盲打后确认即可。

Set the account password. Note that in Linux, there are no asterisk (*) prompts when typing the password; just type it blindly and confirm it.

<img src="../../../res/img/sdk/env/enable Linux4.png" alt="10" style="zoom:80%;" />



## Step2 SDK安装
## Step2 SDK Installation
### 1. 在Ubuntu上安装git

Install Git on Ubuntu.

​	在正式开始装SDK前，需要在ubuntu上安装git并且连接到github仓库，在ubuntu上输入以下代码，安装git：

Before officially installing the SDK, you need to install Git on Ubuntu and connect it to the GitHub repository. Enter the following command in Ubuntu to install Git:

```
sudo apt update && sudo apt upgrade -y
sudo apt install git -y
```

（1）接下来配置git以连接到github，首先配置git用户名和邮箱，替换以下代码的”Your Name” 和”your_email@example.com”为你自己的github用户名和邮箱：

Next, configure Git to connect to GitHub. First, set up your Git username and email by replacing "Your Name" and "your_email@example.com" in the following code with your own GitHub username and email:

```
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

（2）生成SSH密钥，运行以下命令（如果没有特殊要求可以直接Enter使用默认位置~/.ssh/id_rsa）,若系统提示输入密码，可以选择设置一个密码保护密钥，也可以直接按Enter跳过：

Generate an SSH key by running the following command (if you have no special requirements, you can simply press Enter to use the default location ~/.ssh/id_rsa). If the system prompts you to enter a passphrase, you can either set one to protect the key or press Enter to skip it:

```
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

​	出现以下页面内容，生成SSH密钥成功。

When the following page content appears, the SSH key has been successfully generated.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu1.png" alt="1" style="zoom:80%;" />

（3）添加SSH密钥到SSH代理：

Add the SSH key to the SSH agent:

```
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

（4）将公钥添加到github的SSH密钥列表中：

Add the public key to the SSH keys list on GitHub:

 <1> 获取你的SSH公钥，运行以下代码，并复制输出的全部内容

Retrieve your SSH public key by running the following code, and copy all of the output content.

```
cat ~/.ssh/id_rsa.pub
```

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu2.png" alt="2" style="zoom:80%;" />

<2> 登录github账户，进入 Settings > SSH and GPG keys > New SSH key

Log in to your GitHub account, then go to Settings > SSH and GPG keys > New SSH key.

<3> 粘贴公钥到Key字段，设置一个标题，然后点击 Add SSH key

Paste the public key into the Key field, provide a title, and then click Add SSH key.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu3.png" alt="3" style="zoom: 67%;" />

（5）测试连接，输入以下代码确认是否配置成功

Test the connection by entering the following command to confirm if the configuration was successful.

```
ssh -T git@github.com
```

​	弹出如下消息，则连接成功。

If the following message appears, the connection is successful.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu4.png" alt="3" style="zoom: 67%;" />

（6）配置好git和SSH的连接就可以开始克隆github上的仓库：

Once Git and the SSH connection are configured, you can start cloning the repository from GitHub.

```
git clone git@github.com:username/repository.git
```

​替换username/repository.git为你要克隆的GitHub仓库路径，在这里我们的仓库地址是openecos-projects/embedded-sdk.git

Replace username/repository.git with the path of the GitHub repository you want to clone. In this case, our repository address is openecos-projects/embedded-sdk.git。

出现如下界面，就成功完成了在Ubuntu 24.04上配置git连接github的全部步骤。

Once the following interface appears, you have successfully completed all the steps for configuring Git to connect to GitHub on Ubuntu 24.04.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu5.png" alt="3" style="zoom: 67%;" />

### 2. 下面开始进入SDK的安装

let's begin the SDK installation.

（1）在Ubuntu里面输入如下指令,进入文件夹安装脚本添加执行权限

In Ubuntu, enter the following commands to navigate to the folder and add execution permissions to the installation script.

```
cd embedded-sdk
chmod +x install.sh
./install.sh
```

​出现以下报错，是因为 Ubuntu 系统太“干净”了，缺少编译代码必须的基础工具（编译器和解压缩工具）。

The following error occurs because the Ubuntu system is too "clean" and lacks the basic tools (compiler and decompression tools) required for compiling code.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu6.png" alt="6" style="zoom:80%;" />

​输入以下指令，注意执行 sudo 命令时会要求输入密码，输入密码时屏幕不会显示任何字符，输完直接按回车即可。

Enter the following command. Note that when executing a sudo command, you will be prompted for a password. No characters will be displayed on the screen while typing; just press Enter after typing it.

```
sudo apt-get update
sudo apt-get install gcc make unzip -y
```

（2）安装完以上内容，重新运行安装脚本：

After installing the above components, run the installation script again:

```
./install.sh
```

​	出现以下界面，就可以往下进行

When the following interface appears, you can proceed to the next step.

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu7.png" alt="7" style="zoom: 80%;" />

（3）执行以下代码来**<font>更新一下环境变量</font>**

Run the following command to update the environment variables.

```
source ~/.bashrc
```
## Step3 连接Ubuntu与Vs code
## Step3 Connect Ubuntu with VS Code

在 VS Code 里连接 Ubuntu可以让你从“痛苦的黑窗口”进入到“舒适的图形化界面”。

Connecting Ubuntu within VS Code allows you to transition from the "painful black window" to a "comfortable graphical interface."

### 1. 下载 Remote Explorer 与 WSL扩展

Download the Remote Explorer and WSL extensions.

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code1.png" alt="1" style="zoom:80%;" />

点击 VS Code 左下角的蓝色图标（也就是那个由两个箭头组成的小方块**<font color='blue'>< ></font>**）。

Click the blue icon in the bottom-left corner of VS Code (the small square composed of two arrows). 

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code2.png" alt="2" style="zoom:80%;" />

​在顶部弹出的菜单中选择"Connect to WSL"

In the menu that appears at the top, select "Connect to WSL".

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code3.png" alt="3" style="zoom:80%;" />

系统会自动建立连接。连接成功后，VS Code 左下角的蓝色区域会显示 WSL: Ubuntu-24.04。

The system will automatically establish the connection. Once connected successfully, the blue area in the bottom-left corner of VS Code will display "WSL: Ubuntu-24.04".

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code4.png" alt="4"  />

### 2. 配置 Vs code 工作区路径

Configure the VS Code workspace path.

（1）点击 VS Code 左侧侧边栏第一个图标（Explorer / 文件管理器）。

Click the first icon in the left sidebar of VS Code (Explorer / File Explorer).

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code5.png" alt="5" style="zoom:80%;" />

（2）点击 Open Folder（打开文件夹）

Click "Open Folder"

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code6.png" alt="6" style="zoom:80%;" />

（3）在中间弹出的输入框中，你会看到 /home/happy/ 路径。请点击或输入：/home/happy, VS Code 的左侧列表就会显示出你的工程结构, main.c就是我们接下来要写代码的地方, build/里存放着编译出来的 .bin 文件。

In the input box that appears in the center, you will see the path /home/happy/. Please click or enter: /home/happy. The left-hand list in VS Code will then display your project structure. main.c is where we will write the code next, and the build/ folder contains the compiled .bin files.

（4）在 VS Code 中按下快捷键 Ctrl + ~ 可以调出内部终端，已经自动定位到 hello 文件夹，在这里输入 make 就能直接编译，无需再切换回 Ubuntu 窗口。

In VS Code, press the shortcut Ctrl + ~ to open the integrated terminal, which will already be automatically located in the hello folder. Here, you can enter make to compile directly, without needing to switch back to the Ubuntu window.
