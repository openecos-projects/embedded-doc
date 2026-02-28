### 1. 创建示例工程

Create a Sample Project

（1）在创建示例工程的目录下执行以下命令，其中 <template_name> 是示例工程模板名称，例如 hello。 执行完会在当前目录下创建一个以模板名称命名的子目录，包含了示例工程的所有文件。

Execute the following command in the directory where you want to create the sample project, replacing <template_name> with the name of the sample project template, for example, hello. After execution, a subdirectory named after the template will be created in the current directory, containing all the files for the sample project.

```
ecos init_project hello -target c2
```

（2）进入该工程目录，开始配置工程

Navigate into the project ，directory to begin configuring the project.

```
cd hello
make menuconfig
```

若有以下报错，是因为 Ubuntu 系统缺编译配置菜单（menuconfig）所需的工具。

If the following error occurs, it's because the Ubuntu system lacks the tools required for the configuration menu (menuconfig).

<img src="../../../res/img/sdk/quickstart/Create_sample_project1.png" alt="1" style="zoom:80%;" />

（3）在终端输入以下命令，安装必要的编译工具：

Enter the following command in the terminal to install the necessary compilation tools:

```
sudo apt-get update
sudo apt-get install bison flex libncurses5-dev libncursesw5-dev -y
sudo apt-get update
sudo apt-get install g++ build-essential -y
```

（4）安装完成后，再次回到 hello 目录（确保你在 ~/embedded-sdk/hello 路径下）执行make menuconfig，此时出现一个蓝色的图形化菜单界面：

After the installation is complete, return to the hello directory (ensure you are in the ~/embedded-sdk/hello path) and execute make menuconfig. A blue graphical menu interface should then appear.

<img src="../../../res/img/sdk/quickstart/Create_sample_project2.png" alt="9" style="zoom:80%;" />

（5）直接按Enter进入Target Hareware Configuration，再回车选择板卡**<font >C2</font>**

Press Enter to go into Target Hardware Configuration, then press Enter again to select the board.

<img src="../../../res/img/sdk/quickstart/Create_sample_project3.png" alt="10" style="zoom:80%;" />

再进入Memory Region Selection选择**<font>SRAM</font>**，保存

<img src="../../../res/img/sdk/quickstart/Create_sample_project4.png" alt="11" style="zoom:80%;" />

（6）  配置界面成功退出后，执行最后一步：

After successfully exiting the configuration interface, perform the final step:

```
make
```

出现下图所示界面我们创建的工程就编译完成了，同时会在build目录下生成retrosoc_fw.elf、retrosoc_fw.hex、retrosoc_fw.bin文件，**<font>使用bin文件进行烧录</font>**即可。

When the interface shown in the image below appears, the compilation of the project we created is complete. At the same time, the retrosoc_fw.elf , retrosoc_fw.hex , and retrosoc_fw.bin files will be generated in the build directory. You can use the .bin file for flashing.

<img src="../../../res/img/sdk/quickstart/Create_sample_project5.png" alt="12" style="zoom:80%;" />

### 2.烧录进板卡

Flash to the Board

(1) 编译完成后，打开下图路径找到**<font>retrosoc_fw.bin</font>**文件

After the compilation is complete, navigate to the path shown in the image below to find the retrosoc_fw.bin file.
<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card1.png" alt="1" style="zoom:75%;" />

(2) 将烧录器连接到板卡，并将烧录器的另一头通过USB连接到电脑，会出现一个新的文件夹

Connect the programmer to the board, and connect the other end of the programmer to your computer via USB. A new folder will appear.
<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card2.jpg" alt="2" style="zoom:80%;" />

(3) 将retrosoc_fw.bin文件复制到该文件夹下

Copy the retrosoc_fw.bin file to this folder.
<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card3.png" alt="3" style="zoom:90%;" />

(4) 然后将烧录器的开关播到另一侧，再把typec线连接到板卡上（拨完如图示）

Then, flip the switch on the programmer to the other side, and connect the USB-C cable to the board (as shown in the diagram after flipping).
<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card4.jpg" alt="4" style="zoom: 50%;" />

(5) 打开串口调试助手，波特率设置为**<font>115200</font>**，按下板卡上的复位键，看到下图界面，我们的第一个工程的全部流程就结束了。

Open the serial debugging assistant, set the baud rate to 115200, press the reset button on the board, and when you see the interface shown in the image below, the entire process for our first project is complete.
<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card5.png" alt="5" style="zoom:67%;" />
