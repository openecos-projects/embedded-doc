# StarrySky L Board
## Board Description
This page is the home page of the **development documentation** for the StarrySky L single-board computer. The StarrySky L series [single-board computer (SBC)](https://en.wikipedia.org/wiki/Single-board_computer) is an official board specially planned and designed by the {--One Student One Chip (YSYX)--} project team in March 2023, after assimilating design experience from several earlier test boards. It is based on **YSYX tape-out SoCs** and is used to evaluate and demonstrate the rich peripheral applications of YSYX SoCs. The project team independently completed the hardware design, production management, tutorial writing, and packaging visual design of the StarrySky L series single-board computers. The short-term goal is to continuously refine the software and hardware systems of the StarrySky L series boards by relying on the two to three YSYX SoC tape-outs each year, providing the open-source community with a stable and easy-to-develop software testing platform. The long-term goal is to build a lightweight software and hardware ecosystem around the StarrySky L series boards and to explore their rich application scenarios in the field of research tape-outs.

## Visual Concept
### Board Design
To ensure the overall visual consistency of the StarrySky L series development boards, the project team standardized the board design with a unified process of **black solder-mask ink + white silkscreen + ENIG pads**, and constrained the board mechanical dimensions to **110 x 84 mm**. Considering functionality and redundancy, StarrySky L series development boards {==**always carry an FPGA system-on-module (SoM)**==}(1). On the one hand, this expands peripheral functions through the ChipLink interface and provides the SoC board with the most basic memory access capability; at the same time, it supports FPGA prototyping for the next generation of YSYX SoCs.
{ .annotate }

1. In the future, the project team plans to completely remove the FPGA SoM from StarrySky L boards. This is mainly because **YSYX SoCs will use IP such as PSRAM or SDRAM instead of the original ChipLink for memory access**, and removing the FPGA SoM can significantly reduce the overall design cost of StarrySky L boards.

### Board Name
To meet the external promotion needs of this series of development boards, the project team carefully selected the official name for this series. To screen eligible names more efficiently, the project team evaluated candidate official names from the following aspects:

- The name must comply with national laws and moral constraints.
- The name must not cause ambiguity or be associated with a specific individual or group.
- The name must fit the board's positioning and characteristics, and must not duplicate the names of boards currently sold publicly on the market.
- The Chinese and English names must correspond to each other, be short, easy to understand, easy to spread, and convenient for external promotion.
- The name must have a certain story and be easy to visualize.

Following the above requirements, the project team brainstormed board names many times and obtained the following list of eligible candidate names:

| Chinese | English | Meaning |
| - | - | - |
| Meteor / Comet / Celestial Dome / Starlight / Constellation / Star River / Nebula / Starry Sky | FlashStar / Galaxy / Nebula / StarrySky | The meaning of a meteor represents a change of fate. The appearance of a meteor is often accompanied by friction within the atmosphere and the ionization effect produced by that friction, so people often regard a meteor as a brand-new beginning. For those who have suffered setbacks and fallen into a trough, a meteor means a new opportunity, a completely new start, bringing new life, new hope, and new opportunities. Therefore, meteors are regarded as an exciting symbol, opening new doors for many people in pursuit of success. Second, the meaning of a meteor also carries a certain warning. Because the energy released during a meteor's brief burning is extremely powerful, similar to a brief explosion, this also shows that people may experience numerous difficulties and unfortunate blows at some point in their lives. Therefore, the symbolic meaning of a meteor also reminds us that we must cherish everything before our eyes and face environmental changes and sudden problems with a positive attitude. Especially in our careers, we should convert this energy into the driving force for our own progress and improve our competitiveness and resilience. |
| Calculator / Abacus | Abacus | The abacus is less than a foot long, yet it embodies the superb mathematical wisdom of the ancient Chinese. It was the most important calculating tool in ancient Chinese commercial activities. It is simple to make and easy to operate, can solve various complex calculations, and can even extract multiple square roots. Similar tools exist both in China and abroad. |
| Cactus | Cactus | I believe that in the hearts of many people, the cactus symbolizes resilience. It can be seen everywhere in desolate deserts and is a rare sight of green in the desert. It shows us the tenacity of life: it not only grows in the desert, but its flowers can also bloom through wind and sun. Therefore, the cactus represents resilience. |
| Sunflower | SunFlower / Helianthus | The sunflower's head always turns with the sun, growing toward the light throughout its life, giving a very inspiring impression. It can symbolize faith, radiance, pride, silent love, and other meanings. |
| Matrix | Matrix | The Matrix is a complex simulation system program built by machines with artificial intelligence. It simulates the human world of the past in order to control humanity. The characters that appear in the Matrix can be regarded as programs with human consciousness. |
| Kiwifruit | Kivi Pi | The kiwifruit (mihoutao, literally "macaque peach") is said to be named because macaques enjoy eating it; another explanation is that it is named for its fuzzy skin, which resembles a macaque. It is a fruit with tender flesh, rich nutrition, and a delicious flavor. Naming in the style of Raspberry Pi. |

After multiple rounds of discussion and screening from various aspects such as naming meaning, effectiveness, and emotional appeal, the project team finally decided to use **StarrySky** as the official name of the board. **StarrySky** was chosen not only because it fits all the requirements set out above very well, but also because **StarrySky** shows us a vast, profound, and mysterious unknown space, faithfully mirroring the entire process of life surging, taking root, sprouting, flowering, and bearing fruit in the universe. It metaphorically represents the mystery and endlessness of scientific exploration, whose beauty we need to discover bit by bit. In addition, the starry sky is the dialectical unity of two images: liveliness and tranquility. The scattered stars embellishing the starry sky are like diamonds inlaid among the stars and moon, emitting a faint glow in the dimness and presenting a picture of **"a sky full of stars and moon over green grass"**; this is the static side. The meteors streaking across the sky, like light ribbons dancing gracefully and slipping into the empty night sky, are the dynamic side. Beneath the starry sky, people can freely imagine the future and release their inner suppression to the fullest. The starry sky perfectly displays a sense of science fiction and romance, bringing hope to people.

### Packaging Design
When designing the overall visual effect of the packaging, the project team fully considered both functionality and aesthetics. First, the design style was set as a modern minimalist geek style, using a white background to clearly display the logos of the many supporting organizations at the bottom. The front features the main full name + secondary full name, the graphic pattern, and the logos of the many supporting organizations, and serves as the main functional face. The bottom face shows the DXF line drawing of the board. During the design process, the team referenced the style of white-background product packaging from Apple and DJI:

![StarrySky development board box die-cut design](../../../res/img/brd/starry-sky-l/pkg/pkg_intro.webp)

The front of the packaging uses **StarrySky + divider line + StarrySky + Arabic numerals** to present the main full name, and uses **"an RV64 single-board computer carrying a student-built CPU"** as the secondary full name. In the upper-left corner of the packaging front is the logo and slogan of the YSYX project; in the upper-right corner is a QR code for the official website of the YSYX project. The logos of all supporting organizations are placed horizontally along the bottom. To the right of the main full name, a geometric pattern with a starry-sky background is designed. The geometric pattern selects common astronomical phenomena in the starry sky as design elements:

- Constellations
- Satellites
- Star trails and meteor showers

The meanings of the geometric pattern composed of the above design elements are as follows:

- Points represent vias (in the narrow sense) and stars (in the broad sense); lines are analogous to vias in chips and PCBs (in the narrow sense) and planetary orbits (in the broad sense), demonstrating a "point -> line" connection (a change between static and dynamic).
- The pattern includes the Big Dipper (constellations, collective, static) and a star + satellite binary system (satellites, collective, static). They are connected by lines, like meteors (individual, dynamic). Many meteors converging together form a meteor shower (collective, dynamic), and a meteor shower happens to be the most romantic and beautiful sight in the night sky.

![3D rendering of the StarrySky development board box](../../../res/img/brd/starry-sky-l/pkg/pkg_3d.webp)

In addition, the packaging design also solved problems such as color loss and blurring during printing, and the manufacturing process was determined. The specific manufacturing parameters are as follows:

- Box type: rear-opening with locking tab bottom
- Internal dimensions: 135 x 37 x 105 mm
- External dimensions: 136 x 38 x 107 mm
- Manufacturing dimensions: 135.6 x 37.6 x 106.1 mm
- Material: 350 g white cardstock, 0.5 mm thick, matte lamination
- Printing: digital inkjet printing

## Versioning Convention
Currently, the hardware version naming of StarrySky L development boards follows the format: **StarrySky L board + v major version.minor version**. A change in the **major version** indicates a **generational** change in the YSYX SoC carried, such as an evolution of the SoC architecture or an improvement in the process node. A change in the **minor version** indicates a modification of the board's hardware peripherals.

## Board Models
Below are the **development documentation** pages for all boards. Click **Details** on a card to jump to the page for that specific board.

<div class="grid cards">
  <ul>
    <li>
      <p class="ecos-brd-card-img">
        <img src="../../../res/img/brd/starry-sky-l/v1.2/core/board_smt_top.webp" />
      </p>
      <p>Full name: StarrySky L Board v1.2<br />Abbreviation: StarrySky L1.2 or L1.2<br />Description: YSYX third iteration, first batch board</p>
      <p class="ecos-brd-card-link">
        <a href="v1.2">Details</a>
      </p>
    </li>
    <li>
      <p class="ecos-brd-card-img">
        <img src="../../../res/img/brd/starry-sky-l/v1.3/core/board_smt_top.webp" />
      </p>
      <p>Full name: StarrySky L Board v1.3<br />Abbreviation: StarrySky L1.3 or L1.3<br />Description: YSYX third iteration, second batch board</p>
      <p class="ecos-brd-card-link">
        <a href="v1.3">Details</a>
      </p>
    </li>
    <li>
      <p class="ecos-brd-card-img">
        <img src="../../../res/img/brd/starry-sky-l/v2.1/core/board_smt_top.webp" />
      </p>
      <p>Full name: StarrySky L Board v2.1<br />Abbreviation: StarrySky L2.1 or L2.1<br />Description: YSYX fourth iteration, first batch board</p>
      <p class="ecos-brd-card-link">
        <a href="v2.1">Details</a>
      </p>
    </li>
    <li>
      <p class="ecos-brd-card-img">
        <img src="../../../res/img/brd/starry-sky-l/v3.0/brd_smt_top.webp" />
      </p>
      <p>Full name: StarrySky L Board v3.0 (StarrySky Pi)<br />Abbreviation: StarrySky L3 or L3<br />Description: YSYX fifth iteration, first batch board</p>
      <p class="ecos-brd-card-link">
        <a href="v3.0">Details</a>
      </p>
    </li>
  </ul>
</div>

## User License
In drafting this document user license, the project team referred to the license terms of many content documents on the Internet, **hoping to provide users with as open a reading and citation experience as possible while ensuring the copyright integrity of the document content**. Please read this statement carefully and understand it thoroughly. Once a user reads this document or publishes its content on other platforms in any form, the user is deemed to have read **all of the following terms** and to have confirmed unconditional acceptance of all of them.

### Public Display
All documentation content on this page is public and can be read free of charge; therefore, there is no option to prevent specific people from seeing any page in the documentation. In addition, this documentation may be indexed by search engines, so some user-contributed content may appear in search results.

### Content Modification
**The {--YSYX--} project team holds the maintenance rights over the documentation content**, used to merge, close, and modify the documentation, without the need to separately notify all users of changes to the content. Users may need to maintain on their own the corresponding changes to the media that cite the content when the cited content changes.

### Content Licensing
All **original content** of the documentation is released under a **restricted free-content copyright license**. This means that anyone may cite, copy, adapt, and distribute it on this website or externally, but the original content of this documentation **may not be applied directly to commercial fields without copyright permission**, and users must state that **the {--YSYX--} project team owns the ownership of the original documentation content and is the source of the citation**, including but not limited to text, images, videos, code, and other forms. Although this site also contains some public news information that may be used fairly, this documentation mainly contains restricted free-content licensed material and focuses on disseminating knowledge; therefore, individuals and organizations are not expected to use this documentation's content without stating ownership and source. When citing certain external resources, this documentation **displays a copyright notice** in accordance with additional licensing terms different from those described on this page. Users of the content are obliged to understand and comply with the licensing terms of this documentation and of the external resources that this documentation may cite. When citing the content of this documentation under the Creative Commons Attribution-Share Alike License (Attribution-ShareAlike), you must attribute the source in one of the ways described in the ***attributing the source*** paragraph above. Note that copyright law protects only the creative expression of ideas, not the ideas or information themselves. Therefore, it is completely legal to read an encyclopedia entry or other work, express it in your own words, and then submit it to this documentation. Please note that when reproducing the content of this documentation on other websites, this documentation does not guarantee that the resources used fairly by that website (text, images, videos, code, etc.) comply with local laws.

For content outside the documentation site (such as email, interest groups, forums, etc.), unless explicitly stated otherwise, **it cannot be assumed to be published under the same license**.

### Disclaimer {#_12}
- Users undertake to use the content of this documentation on lawful and reasonable principles, not to use this documentation for any illegal, malicious, or rights-infringing acts, and not to cite this documentation on any website or platform that violates the laws and regulations of our country.
- The team assumes no legal liability for any accident, negligence, contract damage, defamation, copyright or intellectual property infringement, and resulting losses (including but not limited to direct, indirect, incidental, or consequential losses) arising from any organization or individual downloading or using this documentation.
- Users explicitly acknowledge and agree to all the contents listed in the terms of this statement. Any risks and related consequences that may exist in using this documentation shall be borne entirely by the users themselves, and the team assumes no legal liability.
- After reading this disclaimer, any organization or individual shall lawfully publish, distribute, and use this documentation within the scope permitted by [Content Licensing](#_12). Any legal liability (including but not limited to civil compensation and criminal liability) caused by violating the terms of this disclaimer or violating laws and regulations shall be borne by the violator.
- No organization or individual may apply for related intellectual property rights over this documentation itself without the written authorization of the team.
- If any part of this statement is deemed invalid or unenforceable, that part shall be interpreted to reflect the original intent of the team, and the remaining parts shall remain in full force. An unenforceable part of the statement does not constitute a waiver of our right to enforce that statement.
- The team has the right to unilaterally change the terms of this statement and the contents of its attachments at any time and to announce them via message push, website notices, or other means. They take effect automatically immediately upon announcement without separate notice. If you continue to use this documentation after the announcement of changes to this statement, it means you have fully read, understood, and accepted the revised statement.

**The {--YSYX--} project team reserves the ultimate right of interpretation for all the above terms**

> Author: Miao Yuchi (maksyuki), Miao Yuyang (myyerrol)
