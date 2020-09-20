[(back to projects page)](projects.md)

## first-order-wrapper

I wrote [first-order-wrapper](https://github.com/dunnousername/yanderifier) over the course of a month in the summer of 2020 after learning about [first-order-model](https://aliaksandrsiarohin.github.io/first-order-model-website/). 
First-order-model is a machine learning algorithm that takes a video of a face and an image of a different face, and reanimates the still image to match the movement in the video.
As a visual example, here's an animation from the creators of first-order-model itself (this is theirs, not mine):

![Courtesy of first-order-model developers](https://aliaksandrsiarohin.github.io/first-order-model-website/vox-teaser.gif)

This is obviously really cool, but it's academic code. The developers are data scientists, not programmers, so while the results are extremely impressive, the program isn't exactly the easiest to use.

So, in a day or two I wrote first-order-wrapper (originally called Yanderify). It is a GUI for first-order-model. It's mostly first-order-model code under the hood, but the major differences are:
- first-order-model is a command-line program. I wrote a GUI with tkinter (Python's integrated GUI toolkit) so that the user never has to use the command-line.
- in first-order-model, the repository does not include an entire packaged installation. I bundled all the dependencies into first-order-wrapper so that it is easier for others to use.
- first-order-model does not re-encode the output with audio from the input video. I use ffmpeg to do this with first-order-wrapper.
- first-order-model originally did not work well with graphics cards that had very small amounts of VRAM when the video was longer. first-order-wrapper is optimized for these kinds of cards.

I updated it over the next month, and it really blew up. While not the most interesting thing I have done in my opinion, it has the farthest reach of any of my projects at the time of this writing, and has over 600 stars, 100 forks, and has reached the GitHub trending page at least once. Wow!

I want to make it clear that most of the code is from the developers of first-order-model. However, my contributions have been trying to make this magnificent piece of code accessible to everyone, even those who aren't as technically skilled as most data scientists.
