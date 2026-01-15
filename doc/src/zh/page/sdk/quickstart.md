### 1. 创建示例工程
（1）在创建示例工程的目录下执行以下命令，其中 <template_name> 是示例工程模板名称，例如 hello。 执行完会在当前目录下创建一个以模板名称命名的子目录，包含了示例工程的所有文件。

```
ecos init_project hello -target c2
```

（2）进入该工程目录，开始配置工程

```
cd hello
make menuconfig
```

若有以下报错，是因为 Ubuntu 系统缺编译配置菜单（menuconfig）所需的工具。

<img src="../../../res/img/sdk/quickstart/Create_sample_project1.png" alt="1" style="zoom:80%;" />

（3）在终端输入以下命令，安装必要的编译工具：

```
sudo apt-get update
sudo apt-get install bison flex libncurses5-dev libncursesw5-dev -y
sudo apt-get update
sudo apt-get install g++ build-essential -y
```

（4）安装完成后，再次回到 hello 目录（确保你在 ~/embedded-sdk/hello 路径下）执行make menuconfig，此时出现一个蓝色的图形化菜单界面：

<img src="../../../res/img/sdk/quickstart/Create_sample_project2.png" alt="9" style="zoom:80%;" />

（5）直接按Enter进入Target Hareware Configuration，再回车选择板卡**<font color='blue'>C2</font>**

<img src="../../../res/img/sdk/quickstart/Create_sample_project3.png" alt="10" style="zoom:80%;" />

​	再进入Memory Region Selection选择**<font color='blue'>SRAM</font>**，保存

<img src="../../../res/img/sdk/quickstart/Create_sample_project4.png" alt="11" style="zoom:80%;" />

（6）  配置界面成功退出后，执行最后一步：

```
make
```

出现下图所示界面我们创建的工程就编译完成了，同时会在build目录下生成retrosoc_fw.elf、retrosoc_fw.hex、retrosoc_fw.bin文件，**<font color='red'>使用bin文件进行烧录</font>**即可。

<img src="../../../res/img/sdk/quickstart/Create_sample_project5.png" alt="12" style="zoom:80%;" />

### 2.烧录进板卡
(1) 编译完成后，打开下图路径找到**<font color='red'>retrosoc_fw.bin</font>**文件

<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card1.png" alt="1" style="zoom:75%;" />

(2) 将烧录器连接到板卡，并将烧录器的另一头通过USB连接到电脑，会出现一个新的文件夹

<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card2.jpg" alt="2" style="zoom:80%;" />

(3) 将retrosoc_fw.bin文件**<font color='red'>复制</font>**到该文件夹下

<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card3.png" alt="3" style="zoom:90%;" />

(4) 然后**<font color='red'>将烧录器的开关播到另一侧</font>**，再把**<font color='red'>typec线连接到板卡上</font>**（拨完如图示）

<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card4.jpg" alt="4" style="zoom: 50%;" />

(5) 打开串口调试助手，波特率设置为**<font color='blue'>115200</font>**，**<font color='blue'>按下板卡上的复位键</font>**，看到下图界面，我们的第一个工程的全部流程就结束了。

<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card5.png" alt="5" style="zoom:67%;" />
