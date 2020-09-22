## This is a work in progress!

# SpiderGAN
## Introduction
I've been wanting to mess with StyleGAN(2) for a really long time now. However, I simply haven't had the time, resources or knowledge to do so.

After discovering a machine learning chatroom with a large number of StyleGAN2 users, I was more interested in StyleGAN2, and learned a lot about how it works and how to use it.
So, I decided I'd try to make a fake spider generator with StyleGAN2 in Google Colab. Here's how that went.

## First steps
Originally, I wrote a script to scrape images from the r/whatisthisbug subreddit.
The project was at this stage called BugGAN, and I assumed the subreddit dataset would be good enough.
However, after spending a lot of time trying to get that dataset to work, I eventually realized that it wasn't worth it, for several reasons:
- Most of these images are cellphone quality images of bugs where the bug makes up a very small portion of the image. There simply wasn't going to be a high enough resolution to make the project rewarding.
- The bugs from this dataset were very different from each other. There were many bugs I haven't even seen before, and I don't think an AI would be able to generalize to this concept of a "bug" without a lot of trouble.
- Because the bugs were so different, it was near impossible to draw a rigid line on what counts as a bug. This may seem easy, but if you label the entire bug, then the legs cover most of the image, which is uninteresting and could lead to issues. It isn't easy to define a "bug head" that is intuitive to both a neural network and myself.
After looking for more datasets, I was told that Flickr would be a good website to look. So, I went searching, and found [this](https://www.flickr.com/groups/spiders/): 44,000 images of spiders capture in high quality by *real* photographers.
This is where SpiderGAN really started taking shape.
