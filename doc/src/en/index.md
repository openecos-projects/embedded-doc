# Home
## Introduction
ECOS Embedded (hereinafter referred to as "The Project") is an open-source knowledge sharing platform created by the ECOS Team in October 2025. **It is designed to bring together tutorials and development resources for chip boards.** The content mainly includes chip datasheets, board wikis, embedded SDKs, embedded development tools, and typical application examples (In the early stage, the focus will be on documentation. Later, based on actual progress, the team may introduce interactive features such as competitions and forums). Unlike most other embedded projects, all official boards released under The Project use main control chips based on the [RISC-V open-source instruction set architecture](https://riscv.org). Furthermore, the ECOS Team is responsible for the physical design of each chip (with varying levels of involvement depending on the solution), as well as managing tapeout and packaging. This ensures that The Project receives strong and timely technical support from the ECOS chip team. It also enables in-depth collaboration on software-hardware co-optimization, jointly driving ECOS chips to become **"easier to use, more practical, and more user-friendly".**

## Background
The core purpose of the ECOS Team in establishing this embedded project is to **build and expand the open-source chip software and hardware ecosystem, thereby enhancing the influence and practical value of open-source chips.** For any chip to be adopted by a certain number of users in a specific field, several key elements are essential: **the chip's features must meet user needs, there must be comprehensive development materials and supporting tools, and there must be convincing typical application examples.** The reason for the embedded project's existence is to be guided by these key elements. It aims to help chip developers clarify design requirements (such as chip specifications, target user groups, and usage scenarios). It also seeks to build a general-purpose software and hardware ecosystem from scratch. By integrating the design philosophies of "top-down" (tracing back from the application to the development side) and "software-hardware co-design", The Project aims to build a bridge connecting developers' innovative ideas with consumers' practical needs. The ultimate goal is that, one day, open-source chips can truly help people solve specific problems in their daily lives.

## Goal
The goals of The Project are divided into three stages based on their respective phases (as a space enthusiast, the author referred to the "Orbit, Land, and Return" phases of the China Lunar Exploration Program when setting these goals). The first stage aims to **verify the chip's functionality and performance (abbreviated as Verify)**, the second stage aims to **build the embedded software ecosystem (abbreviated as Build)**, and the third stage aims to **achieve deployment in specific application scenarios (abbreviated as Apply)**. The detailed breakdown of these three stages is as follows:

- **Verify:** This stage is mainly for **chip developers**. By designing a series of PCB test boards with different specifications, we explore the best ways to build peripheral hardware circuits for open-source chips. This also meets the need for chip function and performance verification, allowing developers to write specific programs to check if the chip meets design standards. The focus here is on verifying the chip itself, so board design does not prioritize expansion, aesthetics, or miniaturization.
- **Build:** This stage is mainly for **application developers**. Based on experience gained in the "Verify" stage, we design a series of PCB development boards with different specifications to enrich the hardware functions of embedded systems. More effort is shifted to building the embedded software ecosystem, including development environments, embedded SDKs, example code, typical applications, and user manuals. The goal is to let developers prototype applications for open-source chips as smoothly as they would using [Arduino]((https://www.arduino.cc)), [Raspberry Pi](https://www.raspberrypi.com), or [Espressif](https://www.espressif.com.cn) boards.
- **Apply:** This stage is mainly for **general consumers**. Based on the prototype applications collected during the "Build" stage, we target pain points or areas for improvement in consumers' daily lives. We aim to design a series of typical embedded software and hardware solutions using innovative approaches, providing consumers with a good user experience at a relatively low cost. Additionally, we actively collaborate with major open-source projects worldwide to create more hardware products with real practical value, contributing modestly to the vision of "open-source chips for a universally beneficial world".

## Contribution
We sincerely invite researchers and enthusiasts from the fields of chips, embedded systems, and software to join us in pushing The Project forward. We firmly believe that the exchange, collision, and integration of diverse ideas is key to opening up new possibilities for open-source chip applications. This is not only about technological breakthroughs but also about a journey of open collaboration. Therefore, if you are passionate about this, or if you have any questions or valuable ideas, please do not hesitate to contact us. Thank you!

All official projects under The Project use the Apache-2.0 open-source license. Its main feature is **allowing users to modify the code for secondary use and distribute it as either closed-source or open-source products (i.e., it is business-friendly). However, it requires that when distributing the software, the original copyright, patent, trademark, and attribution notices must be retained, and modifications must be noted in the header comments of the modified files.** The file header for ECOS Embedded projects is as follows:

```
Copyright 2025 ECOS Team

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## Contact
| Name | Role | Contact | Responsibilities |
| - | - | - | - |
| Hao Li | Administrator, Contributor	 | [lihao2024@ict.ac.cn](mailto:lihao2024@ict.ac.cn) | Project Management, PCB Design, Packaging Design, Embedded Software |
| Yuchi Miao | Administrator, Contributor	 | [miaoyuchi@ict.ac.cn](mailto:miaoyuchi@ict.ac.cn) | Project Management, PCB Design, Packaging Design |
| Yuyang Miao | Administrator | [miaoyuyang@ict.ac.cn](mailto:miaoyuyang@ict.ac.cn) | Project Management, Documentation Maintenance |
