[(back to projects)](projects.md)

## Part 1

![SpiderGAN](spidergan.png)

> This page is very much a partial experimental log of an experimental project.
> There were no plans at the beginning because, frankly, I wasn't entirely sure how this worked.
> As I learned from other experts, the direction of the project rapidly changed, so at times this article can be confusing to read.
> I plan to write a more refined version of this article in the future. For those interested, the following text shows the experimental nature and thought process of the project.

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

> What I learned: the most obvious dataset source might not be the best. Reddit provides structured data and a convenient API, but Flickr was orders of magnitude better.

## Finding spiders
After gather all 44,000 images from Flickr using their API and [this awesome script](https://github.com/antiboredom/flickr-scrape), I set out to make a YoloV3 model using [this repo, out of fear for compiling the Darknet version](https://github.com/AntonMu/TrainYourOwnYOLO).
YoloV3 is a real-time object detection model that requires around a hundred labeled images in order to produce decent results.

Originally, I labeled 100 images, but didn't select the bounding boxes correctly. I would select the legs if they were easy to spot and weren't too big, and I'd select the "center" of the spider if the legs were too large or very thin.
This was bad because it meant that the model now thought there were two spiders; an "inner" spider, and an "outer" one. I ended up relabeling all of my data.

> What I learned: consistency in the labels of a dataset is really important, especially for object detection.

After labeling more spiders, I trained YoloV3 again. Afterwards, I "cherrypicked" it's outputs.
A good analogy for cherrypicking is giving a student several essays and then asking him/her to write a few dozen more essays that are similar to the examples.
Afterwards, you read each essay, and repeat the process, except in addition to the sample essays you had before, you also put in a few of the better-written essays that the student wrote. The network's output is filtered and reused as input.

Eventually, the model worked pretty well, and I started using it to crop images. Then, I took the cropped images, and selected the best ones to use as training for StyleGAN2.

> When the YoloV3 model provided bounding boxes around a spider, they were usually pretty good. However, it would often include a bad bounding box, sometimes more than one bad bounding box, alongside or in place of the desired bounding box.
> What I learned: under no circumstances should you blindly take the output of one AI and train another AI with it without reviewing the output first.

Originally, I took 1,217 cropped images and started training StyleGAN2. I used dvs' colab environment, which can be found [here](https://github.com/dvschultz/ai/blob/master/StyleGAN2_Augmentations.ipynb). Afterwards, I increased this to 2,000 images. I transfer-learned from the official StyleGAN2 256x256 cats config-f model, mostly since this was a 256x256 model, and not enough of my images had an effective resolution higher than that which would warrant the expense of training a larger model. On colab, I was able to train with gpu-base size of 16 images at a minibatch of 32 images, on 16GB V100 and P100 cards.

After a few days of training, at just under 2000 kimg, my results looked this:
<details>
  <summary><b>Click to view some fake spiders</b></summary>
  
  <img src="spidergan_reals.jpg" alt="almost 2000 kimg" />
  
</details>

For comparison, here are the real ones, [courtesy of the Flickr Spiders group](https://www.flickr.com/groups/spiders/):
<details>
  <summary><b>Click to view some real spiders</b></summary>
  
  <img src="spidergan_reals.jpg" alt="real spiders" />
  
</details>

Notice the caterpillar-like image in the fakes. Also, a lot of the images looked similar to the reals; was that normal, or was it memorizing the inputs? There were only 2000 training images after all, and it had seen each of them nearly 1000 times. Also, it would often get confused when there were spiderwebs in the image.

Both of these issues made me reconsider my dataset. I'm currently experimenting with U^2-Net to mask off the background of the images to solve the web issue, and also to make it not waste time memorizing the background. Additionally, I might make my dataset larger. I was originally going to use 10,000 images, but 2,000 worked fine, so I decided to not worry about dataset size, but that might be more important than I thought.

## A "small" point of reflection

These sorts of projects are always experimental. It's all about trial and error - *lots* of trials and *lots* of errors. This means it is quite necessary to take the time and reflect on parts of your experiments that you might have overlooked.

This is the command I used to do training:
```
!AUG_PROB=0.5 python run_training.py --num-gpus=1 --mirror-augment=True 
--data-dir=/content/drive/My\ Drive/stylegan2-aug-colab/stylegan2/datasets 
--dataset=buggan_tf256_3 --config=config-f  --res-log=8 --min-h=1 --min-w=1 --resume-pkl=$pkl
--resume-kimg=$resume_kimg --augmentations=True --metrics=None
```

There's not much special about it. Most of it is just the same command that I started with on dvs's colab. The most important change is setting `AUG_PROB` to 0.5 instead of 0.2.

What does `AUG_PROB` mean? Well, here's some info about it in the Colab notebook:
> The default is 0.1. If you have a small training set you may want to go higher than that but note that the Karras paper does say if you set this value too high you may find it bleeds into the outputs.
(I'm pretty sure the default value is actually 0.2, by the way).

But what does it do? Well, at this point I realized I wasn't entirely sure. It's a setting that comes from the fork of StyleGAN2 with augmentations. I didn't really understand what augmentations were, and assume it didn't really matter, but if you don't know what your tools do, you can't use them effectively. So, it's very likely that these variables have a greater significance than I thought they did.

Gwern is a really interesting guy. I've learned a lot about StyleGAN2 from his blog (which I liked so much I thought I'd start my own blog in a similar format), and he's done several projects which sparked my interest for machine learning and data science. I highly recommend you go check out his blog if you like what you're seeing here.
Anyway, Gwern wrote this [really in-depth comment](https://github.com/tensorfork/tensorfork/issues/35) that explains augmentations pretty well. I'll summarize the relevant bits here.

GANs (including StyleGAN/StyleGAN2) take an interesting approach to image generation. There are two networks - a generator, which creates fake images, and a discriminator, which tries to discern whether an image is real or fake. The discriminator gets a few images - some from our dataset of real spiders, and some from the generator's outputs. It'll output a confidence value (is this a real image?) for each input, and then it'll be trained ("here's what you did right, here's what you did wrong, and here is the correct answer" in an less scientific sense) so that it improves. At the same time, the generator will be trained; if it fools the discriminator, it'll get "rewarded", and if it fails, it'll have to adapt to make more realistic images. This battle between the two networks makes them compete between each other and get better until it is hard for a human to discern a real image or a fake image.

This means that the generator isn't directly trained on the real images - instead, it tries to replicate what the discriminator sees as real input.

Normally, this wouldn't matter much. However, we are working with augmentations. Augmentations are a way to raise the number of real images the discriminator sees without making a bigger dataset. For example, you can mirror each image, and now you have twice the dataset!

### Warning
> A lot of the information between here and the next section is *wrong*. I've reached out to others who know more about this than me and they recommended I read one of the papers mentioned in the git issue as well as the papers on StyleGAN1/2. In the section that follows this one, I'll re-examine the claims I made below after reading both papers and getting a better understanding of augmentations. The abstracts for the specific papers I'm reading can be found [here](https://arxiv.org/abs/2002.04724) (Improved Consistency Regularization for GANs) and [here](https://arxiv.org/abs/1912.04958) (Analyzing and Improving the Image Quality of StyleGAN).
> This section is left in to explain my thought process, and so that I can reflect on what I have learned at a later point in this project.

However, it isn't all that simple. If you only augment the real inputs, then the generator will try to replicate the distortion. Luckily, this is done for both inputs with the colab as far as I can tell. Still, some augmentations aren't helpful in our case. There are several augmentations, which I'll look at one by one.

There are some augments applied batchwise:

- `color` is an augment that slightly changes the color. Spiders are colorful so we can probably leave this one in.
- `brightness` is an augment that changes the brightness. This is probably fine.
- `batchcutout` places a black square over a random part of the image. Spiders are often black, so we definitely don't want this!
- `mirrorh` mirrors an image left-right. We're already using `--mirror-augment`, and spiders are symmetrical, so we want this to "bleed through". In other words, only apply it to the real inputs (which `--mirror-augment` does) so that the generator learns that spiders are symmetrical when trying to fake the discriminator.
- `mirrorv` mirrors an image up-down. Some of our inputs images look like the bottom-center spider in the "real spiders" image above, so we wouldn't want to mirror them vertically.
- `cutmix` blends input images together. This won't really make sense since the spider images can be very different.

There are also others applied individually to images:

- `zoomin`, `zoomout` and `randomzoom` zoom into an image. We probably don't want to mess with these since we want the size of the spider to stay the same.
- `xtrans`, `ytrans` and `xytrans` pan around an image. This is probably fine since they won't affect it enough to cause issues.
- `cutout` puts a block square over a random part of a single image. We definitely don't want that since spiders are black.

Here's a visual example from that GitHub issue (some of these don't apply or have different names):

![augment types](https://user-images.githubusercontent.com/352559/83973591-945ea900-a8b5-11ea-81cd-e93b84efcbdb.png)

It was also recommended that I increase the augmentation probability slightly. So, our new command looks like this:
```
!AUG_PROB=0.7 AUG_POLICY='color,brightness,xtrans,ytrans,xytrans' python run_training.py --num-gpus=1 --mirror-augment=True 
--data-dir=/content/drive/My\ Drive/stylegan2-aug-colab/stylegan2/datasets 
--dataset=buggan_tf256_3 --config=config-f  --res-log=8 --min-h=1 --min-w=1 --resume-pkl=$pkl
--resume-kimg=$resume_kimg --augmentations=True --metrics=None
```

At first I also thought that `--resume-kimg=$resume_kimg` could be an issue. Earlier versions of StyleGAN(1) were progressive, meaning the kimg count would determine how the model was trained. However, this isn't the case with StyleGAN2's `config-f`.

## A "small" point of reflection (part 2)

After reading and talking about the papers it looks like I was mostly correct on how augmentations work. However, the main issue with augmentations isn't the risk of them bleeding through, but that the loss of information that occurs with augs such as cutout isn't helpful for GANs.

Additionally, some of the aug policies we used are repetitive. Lastly, while talking about the different augments, pdillis mentioned that the color augment generally had issues. In my previous tests I didn't see any issues that seemed to be related to color, and it doesn't really matter what color a spider is, so I decided it was fine to leave this in until I had issues.

Zoom shouldn't cause issues like I thought it would since not that much information is lost and it shouldn't be too extreme that it distorts everything horribly.

`mirrorv` most likely won't cause issues since the generator will still create images that follow the distribution of the training set.

So, the new command should look like this:
```
!AUG_PROB=0.7 AUG_POLICY='color,randomzoom,xytrans,mirrorv' python run_training.py --num-gpus=1 --mirror-augment=True 
--data-dir=/content/drive/My\ Drive/stylegan2-aug-colab/stylegan2/datasets 
--dataset=buggan_tf256_3 --config=config-f  --res-log=8 --min-h=1 --min-w=1 --resume-pkl=$pkl
--resume-kimg=$resume_kimg --augmentations=True --metrics=None
```

## Some bigger issues (not the end!)

I started training with this new command a few days ago, with similar results to the ones above. However, I'm pretty sure that I will run into a larger issue: dataset.
My dataset might be too diverse to attempt to train with so few samples. There's essentially two types of spider images:

- "Top-down" images like the image immediately to the right of the bottom left corner image on the real panel. These generally are either hanging from webs where the camera is horizontal, or on a horizontal surface with the camera above the spider and pointing straight down. The camera axis, in more specific terms, is perpendicular to the plane of the spider's legs. Additionally, the spiders usually don't have fuzzy legs or fine details.
- "Portrait" images like the bottom right corner image of the real panel. These are images of jumping spiders with fuzzy legs. The camera angle is often more-or-less parallel with the plane of the spider's legs, so that the spider's eyes are clearly seen.

Because StyleGAN doesn't inherently understand the concept of 3D space and perspective, the dataset might be too small for it to be able to generalize. The best option would be to either find more data or make a new dataset consisting of images from only one category.

I decided I'd go the route of making a new "portrait" dataset with jumping spiders. Making a new dataset and a new model takes lots of time and lots of patience, though, so this will end up being "part 2." Stay tuned!
