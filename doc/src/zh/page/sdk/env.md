# 环境准备

## Step1 安装WSL子系统

### 1. 启用开发者模式111

（1）在设置中查找Windows更新设置

<img src="../../../res/img/sdk/env/env_windows_setting.png" alt="1" style="zoom:80%;" />

（2）找到开发者选项，开启**<font color='blue'>“开发人员模式”</font>**

<img src="../../../res/img/sdk/env/env_windows_setting1.png" alt="2" style="zoom:80%;" />
### 2. 启用Linux子系统

（1）打开控制面板，找到"程序与功能"

<img src="../../../res/img/sdk/env/enable Linux1.png" alt="3" style="zoom:80%;" />

（2）点击“启用或关闭Windows功能”

<img src="../../../res/img/sdk/env/enable Linux2.png" alt="4" style="zoom:80%;" />

（3）往下滑勾选“适用于Linux的Windows”子系统选项，更改完立即**<font color='red'>重启电脑</font>**。

<img src="../../../res/img/sdk/env/enable Linux3.png" alt="5" style="zoom:80%;" />

<img src="../../../res/img/sdk/env/enable Linux4.png" alt="6" style="zoom: 67%;" />
### 3. 安装Linux子系统

（1）在Microsoft Store中搜索“ubuntu”

<img src="../../../res/img/sdk/env/install Linux1.png" alt="7" style="zoom: 67%;" />

（2）安装并启动Ubuntu 24.04.1

<img src="../../../res/img/sdk/env/install Linux2.png" alt="8" style="zoom:67%;" />

（3）启动后创建账号，填写用户名，注意用户名**<font color='red'>不能有大写字母</font>**。

<img src="../../../res/img/sdk/env/install Linux3.png" alt="8" style="zoom:67%;" />

（4）设账号密码，Linux的密码输入没有*号提示，盲打后确认即可。

<img src="../../../res/img/sdk/env/enable Linux4.png" alt="10" style="zoom:80%;" />



## Step2 SDK安装

### 1. 在Ubuntu上安装git

​	在正式开始装SDK前，需要在ubuntu上安装git并且连接到github仓库，在ubuntu上输入以下代码，安装git：

```
sudo apt update && sudo apt upgrade -y
sudo apt install git -y
```

（1）接下来配置git以连接到github，首先配置git用户名和邮箱，替换以下代码的”Your Name” 和”your_email@example.com”为你自己的github用户名和邮箱：

```
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

（2）生成SSH密钥，运行以下命令（如果没有特殊要求可以直接Enter使用默认位置~/.ssh/id_rsa）,若系统提示输入密码，可以选择设置一个密码保护密钥，也可以直接按Enter跳过：

```
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

​	出现以下页面内容，生成SSH密钥成功。

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu1.png" alt="1" style="zoom:80%;" />

（3）添加SSH密钥到SSH代理：

```
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

（4）将公钥添加到github的SSH密钥列表中：

 <1> 获取你的SSH公钥，运行以下代码，并复制输出的全部内容

```
cat ~/.ssh/id_rsa.pub
```

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu2.png" alt="2" style="zoom:80%;" />

<2> 登录github账户，进入 Settings > SSH and GPG keys > New SSH key

<3> 粘贴公钥到Key字段，设置一个标题，然后点击 Add SSH key

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu3.png" alt="3" style="zoom: 67%;" />

（5）测试连接，输入以下代码确认是否配置成功

```
ssh -T git@github.com
```

​	弹出如下消息，则连接成功。

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu4.png" alt="3" style="zoom: 67%;" />

（6）配置好git和SSH的连接就可以开始克隆github上的仓库：

```
git clone git@github.com:username/repository.git
```

​	替换username/repository.git为你要克隆的GitHub仓库路径，在这里我们的仓库地址是**<font color='green'>openecos-projects/embedded-sdk.git</font>**。出现如下界面，就成功完成了在Ubuntu 24.04上配置git连接github的全部步骤。

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu5.png" alt="3" style="zoom: 67%;" />

### 2. 下面开始进入SDK的安装

（1）在Ubuntu里面输入如下指令,进入文件夹安装脚本添加执行权限

```
cd embedded-sdk
chmod +x install.sh
./install.sh
```

​出现以下报错，是因为 Ubuntu 系统太“干净”了，缺少编译代码必须的基础工具（编译器和解压缩工具）。

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu6.png" alt="6" style="zoom:80%;" />

​输入以下指令，注意执行 sudo 命令时会要求输入密码，输入密码时屏幕不会显示任何字符，输完直接按回车即可。

```
sudo apt-get update
sudo apt-get install gcc make unzip -y
```

（2）安装完以上内容，重新运行安装脚本：

```
./install.sh
```

​	出现以下界面，就可以往下进行

<img src="../../../res/img/sdk/env/Installing Git on Ubuntu7.png" alt="7" style="zoom: 80%;" />

（3）执行以下代码来**<font color='red'>更新一下环境变量</font>**

```
source ~/.bashrc
```
## Step3 连接Ubuntu与Vs code

在 VS Code 里连接 Ubuntu可以让你从“痛苦的黑窗口”进入到“舒适的图形化界面”。

### 1. 下载 Remote Explorer 与 WSL扩展

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code1.png" alt="1" style="zoom:80%;" />

点击 VS Code 左下角的蓝色图标（也就是那个由两个箭头组成的小方块 **<font color='blue'>< ></font>**）。

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code2.png" alt="2" style="zoom:80%;" />

​在顶部弹出的菜单中选择"Connect to WSL"

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code3.png" alt="3" style="zoom:80%;" />

​	系统会自动建立连接。连接成功后，VS Code 左下角的蓝色区域会显示 WSL: Ubuntu-24.04。

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code4.png" alt="4"  />

### 2. 配置 Vs code 工作区路径

（1）点击 VS Code 左侧侧边栏第一个图标（Explorer / 文件管理器）。

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code5.png" alt="5" style="zoom:80%;" />

（2）点击 Open Folder（打开文件夹）

<img src="../../../res/img/sdk/env/Connect Ubuntu with VS Code6.png" alt="6" style="zoom:80%;" />

（3）在中间弹出的输入框中，你会看到 /home/happy/ 路径。请点击或输入：/home/happy, VS Code 的左侧列表就会显示出你的工程结构, main.c就是我们接下来要写代码的地方, build/里存放着编译出来的 .bin 文件。

（4）在 VS Code 中按下快捷键 Ctrl + ~ 可以调出内部终端，已经自动定位到 hello 文件夹，在这里输入 make 就能直接编译，无需再切换回 Ubuntu 窗口。
