### 1. Create a Sample Project

* Execute the following command in the directory where you want to create the sample project, replacing <template_name> with the name of the sample project template, for example, hello. After execution, a subdirectory named after the template will be created in the current directory, containing all the files for the sample project.

```
ecos init_project hello -target c2
```

* Navigate into the project ，directory to begin configuring the project.

```
cd hello
make menuconfig
```

If the following error occurs, it's because the Ubuntu system lacks the tools required for the configuration menu (menuconfig).

<img src="../../../res/img/sdk/quickstart/Create_sample_project1.webp" alt="1" style="zoom:80%;" />

* Enter the following command in the terminal to install the necessary compilation tools:

```
sudo apt-get update
sudo apt-get install bison flex libncurses5-dev libncursesw5-dev -y
sudo apt-get update
sudo apt-get install g++ build-essential -y
```

* After the installation is complete, return to the hello directory (ensure you are in the ~/embedded-sdk/hello path) and execute make menuconfig. A blue graphical menu interface should then appear.

<img src="../../../res/img/sdk/quickstart/Create_sample_project2.webp" alt="9" style="zoom:80%;" />

* Press Enter to go into Target Hardware Configuration, then press Enter again to select the board.

<img src="../../../res/img/sdk/quickstart/Create_sample_project3.webp" alt="10" style="zoom:80%;" />

​	Then go to Memory Region Selection, select SRAM, and save.

<img src="../../../res/img/sdk/quickstart/Create_sample_project4.webp" alt="11" style="zoom:80%;" />

* After successfully exiting the configuration interface, perform the final step:

```
make
```

When the interface shown in the image below appears, the compilation of the project we created is complete. At the same time, the retrosoc_fw.elf , retrosoc_fw.hex , and retrosoc_fw.bin files will be generated in the build directory. You can use the .bin file for flashing.

<img src="../../../res/img/sdk/quickstart/Create_sample_project5.webp" alt="12" style="zoom:80%;" />

### 2. Flash to the Board

* After the compilation is complete, navigate to the path shown in the image below to find the retrosoc_fw.bin file.
	<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card1.webp" alt="1" style="zoom:75%;" />

* Connect the programmer to the board, and connect the other end of the programmer to your computer via USB. A new folder will appear.
	<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card2.webp" alt="2" style="zoom:80%;" />

* Copy the retrosoc_fw.bin file to this folder.
	<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card3.webp" alt="3" style="zoom:90%;" />

* Then, flip the switch on the programmer to the other side, and connect the USB-C cable to the board (as shown in the diagram after flipping).
	<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card4.webp" alt="4" style="zoom: 50%;" />

* Open the serial debugging assistant, set the baud rate to 115200, press the reset button on the board, and when you see the interface shown in the image below, the entire process for our first project is complete.
	<img src="../../../res/img/sdk/quickstart/Burned_into_the_board_card5.webp" alt="5" style="zoom:67%;" />
