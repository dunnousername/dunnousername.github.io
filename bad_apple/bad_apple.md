[(back to projects)](/projects.md)

> **This page is under construction.**
> The content on this page is not final and should not be treated as such.

# Fitting "Bad Apple!!" losslessly on a 1.44MB floppy disk
## Introduction
### "Bad Apple!!"?

For the uninitiated, ["Bad Apple!!"](https://www.youtube.com/watch?v=9lNZ_Rnr7Jc) refers to a background music track from one of the *Touhou Project* games, as well as a separate monochrome animation made by a fan.
*Touhou Project* consists of several video games made by a one-man development team continuously from 1997 all the way to the current day. They are a huge part of Japanese culture, both inside and outside of Japan, and there are a huge number of fan-made works set in the Touhou universe as well.
One of these fan-made works is the video linked above, which became a staple of Japanese internet culture.
The "Bad Apple!!" video consists of black-and-white frames that illustrate the lore of the 4th *Touhou Project* game, which synchronize with a remixed version of the background music track of the same name.

Because the animation consists only of two colors, it is widely used as a test vector that can be displayed on low-end hardware, only requiring a 1-bit display and the hardware (and software) to render the animation itself.
People have managed to run it on anything, from [8-bit AVR microcontrollers](https://hackaday.com/2019/01/08/bad-apple-via-the-arduino-mega/) to [TI-84+ SE graphing calculators](https://www.youtube.com/watch?v=Eq5T9dE58E4) to [the Windows Task Manager CPU usage screen](https://www.reddit.com/r/pcmasterrace/comments/hbx72t/if_this_is_not_the_correct_way_to_use_a_64core/), and even [original IBM PC's](https://www.youtube.com/watch?v=MWdG413nNkI&feature=emb_logo) (which I found out about after finishing most of this project; however, he compresses it lossily, while I compress it losslessly).

I wanted to do the same, but fit the whole thing on a 1.44MB floppy disk, and without compressing the animation in any way which visually distorts it. And I did!

## The first iteration

The first iteration is identified as 'version string "1.0.0 beta"'.
More usefully, 'version string "1.0.0 beta"' refers to the first unrevised but functional version of the application.
This version took between 1 and 2 weeks to get working.

The code is not very well optimized and contains a large number of subroutines left over from debugging that don't even appear in the final executable.

In other words, it is messy.

Nevertheless, it still runs, and here's how:

### How it works

Compressing this animation was harder than it would seem at first.

To start, one might think to try encoding it losslessly in a conventional video codec like H.264 or AV1.
This won't work at all; the output file will be way too big, and the decoder by itself most likely wouldn't even fit on a floppy.

Since conventional codecs are out of the question, we'll have to make one ourselves. To start, I converted the video file to a 640x480 grayscale 8-bit (which is converted to 1-bit in the Python script) raw video file using `ffmpeg`. Then, I wrote Python functions to encode each frame into a string of bytes, and concatenate all of these strings of bytes into a single string, and finally output that to a file. Then I devised ~8 iterations of the encoding function, and would compress the output of each encoding function each time using various compression algorithm (7-zip, xzip, and gzip) to find a theoretical lower bound for file size with each method.

Most of these attempts were variants of run-length-encoding, with combinations of the following modifications added; none of them produced a maximum-compressed output below 12MB:
- Doing run-length-encoding on square segments of the image rather than line-by-line of the entire file
- Encoding runs as variable-length integers
- Implicitly alternating colors between each variable-length integer, to save a bit
- Only encoding the XOR difference between consecutive frames

At this point, I wasn't really sure if it was possible. However, then I read about chain coding.

"Chain coding" means encoding only the contours of a region, and describing the contours as a sequence of directions.
This is analogous to walking around the entire border of a country given only a long list of compass directions to walk (it would be implied that each instruction would be 1 degree of latitude/longitude, for example). With some cleverness, it may be possible to encode the borders of a country with this method in less bits than compressing a bitmap image of the country's border naively.
All of the compass directions can be encoded in 3 bits, and since a large portion of the border would be straight line segments, it would compress extremely well too.
In practice, I used 4 bits instead of 3 bits, one for each compass direction, to make my life easier.
Additionally, I used only 4 bits out of every byte. At first, this may seem like a waste of space, but 
because it allows for efficient dictionary compression of short sequences of period 3 (for example, a line with a non-integer slope might fall under this category), it compresses a lot better with zlib.

I originally thought I could get away with using the [even-odd rule](https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule) to fill the contours, but this turned out to be rather difficult to get working, so I eventually just decided to include a list of floodfill points after the list of contours.

All of the lists were delimited with a varint equal to the length, and additionally any time I would have used a 16-bit integer I instead used a varint. This produced a final file size of around 1.2MB after using the highest compression level on zlib.

I used a very slightly modified version of [puff.c](https://github.com/madler/zlib/blob/master/contrib/puff/puff.c) to decompress this blob at runtime without `malloc` (or any other standard library functions), and then I wrote a finite state machine that would parse my custom file format.

After fixing a lot of bugs, it finally appeared to be usable. However, I decided it sounded too quiet. In version 1.1.0 beta I added music.

## The second iteration

Version 1.1.0 beta added a chiptune version of Bad Apple sequenced by Leonardo Ono (reproduced with permission).
Here's a video of it (warning: it may be loud):

[![Version 1.1.0 beta](https://img.youtube.com/vi/XarierMA1EQ/0.jpg)](https://www.youtube.com/watch?v=XarierMA1EQ)

It was at this point in the project that I realized something was broken. The audio ended about halfway through the animation; I think the audio was playing at the correct rate, but the frames appeared to be playing at 15 fps instead of 24 fps (which is weird since it isn't an integer multiple/divisor). This is especially odd considering that both were running from the same clock. Additionally, after playing the whole animation through, I noticed that there were still some artifacts at certain parts.

At this point I decided that the best way to ensure that I keep bugs out of both my encoding and decoding code would be to have them share the same code. This would mean rewriting the functions I used from OpenCV, SciPy and Numpy in C, which sounds like a lot of work, but would also allow me to test that the video renders correctly without having to boot up the floppy image. It would also give me more control over how I define my functions (do contours include parts of the object or are they completely external, for example) and might even run faster if optimized well enough. Currently the Python implementation I was using took several minutes to yield a binary blob with 12 worker processes, which made making changes a long and unrewarding process.

My plan was originally to restructure the code from version 1.1.0 before releasing it. However, 1.1.0 isn't usable, so I won't be releasing restructured code for it.

These are the plans I have for version 2.0.0. In the meantime, if you'd like, you can download a version of 1.1.0 [here](https://cdn.discordapp.com/attachments/724023422224695307/773272977361731614/full.img).

## Version 2.0.0

Version 2.0.0 (called 1.1.0 in the source since it is still being developed) is a complete overhaul of the build process, compression algorithm and encoder.

It doesn't work correctly at the time of this writing, but can be found [here](https://github.com/dunnousername/BadAppleFloppy).

The build process uses Makefiles to compile and run the encoder and compile the final image.

The modified compression algorithm uses a public domain implementation of xzip instead of zlib; this achieves a higher compression ratio at the cost of a higher compression and decompression time.

The format of the chain coding file was also overhauled; directions are represented in a format where neighboring directions are consecutive integers (mod 8). Additionally, external contours of both the negative and positive image are stored, making the output slightly larger, but it prevents me having to rewrite a complicated `findContours` function in C. No floodfill points are stored, except the value of the top left corner of the image, so that colors of certain parts of the image can be derived.

(to be continued)
