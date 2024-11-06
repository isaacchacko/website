'use client';

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Linux.module.css';
import LinuxSignature from '/components/signatures/LinuxSignature';
import RegionsOfInterest from '/components/RegionsOfInterest'
import NavButtons from '/components/LinuxNavButtons'
import '/app/globals.css';

export default function About() {

const scrollToSection = (targetId) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const areas = [
    { x: 5.5, y: 1, width: 44.5, height: 46.5, label: 'ranger', targetId: 'ranger' },
    { x: 50.5, y: 1, width: 21.5, height: 46.5, label: 'neofetch (deprecated)', targetId: 'neofetch' },
    { x: 73, y: 1, width: 21.5, height: 46.5, label: 'cli-visualizer', targetId: 'cli-visualizer' },
    { x: 5.5, y: 48.5, width: 89, height: 47, label: 'lazyvim', targetId: 'lazyvim' },
    { x: 5, y: 97.5, width: 90, height: 2.5, label: 'bumblebee-status', targetId: 'bumblebee-status' },
  ];

  return (
    <>
      <Head>
        Linux
      </Head>
      <title>
      Linux
      </title>
      <div>
        <div className="titleSignatureContainer">
          <LinuxSignature />
          <NavButtons />
        </div>
        <div className={styles.line}>
          <h1>The Premise</h1>
          <p>
            Linux is an alternative operating system from your typical Windows or MacOS. 
            Of the many reasons people switch to Linux is the extreme customizability thats possible.
            Linux ricing (a term coined from <a href='https://www.urbandictionary.com/define.php?term=ricing'>car ricing</a>)
            is the nerd trend of customizing your operating system's aesthetic until it's completely distinct from anyone else.
            (Source: <a href='https://www.reddit.com/r/unixporn/'>redditors</a>)
          </p>
          <h1>My Rice</h1>
          <p>
            Hover/Click below to learn about how I like my rice :) .
          </p>
          <RegionsOfInterest
            imageSrc="/images/i3_rice.png"
            imageAlt="Your image description"
            width={1919}
            height={719}
            divClassName={styles.riceImageContainer}
            className={styles.riceImage}
            areas={areas}
            onAreaClick={scrollToSection}
          />
        </div>
        <div className={styles.line}>
          <h1>Utilized Libraries/Frameworks</h1>
          <h2 id='ranger'>ranger</h2>
          <p>
            <a target="_blank" href='https://github.com/ranger/ranger'>ranger</a> is
            a nifty file explorer for the command line. If loading a GUI to surf your files/moving your mouse to click them was too arduous for you,
            then ranger is your solution. It allows you to use vim-like keybindings to move around your file directory system, and can be mapped 
            to preview various file types with your preferred file viewer. Although I still prefer to use the good ol' <code>cd</code> and <code>ls</code>, 
            sometimes <code>ranger</code> matches my needs just a little bit more.
          </p>

          <h2 id='neofetch'>neofetch</h2>
          <p>
            <a target="_blank" href='https://github.com/dylanaraps/neofetch'>neofetch</a> is the bread and butter of virtually all unix users, no matter what distribution.
            It's the emblem of any riced Linux distribution. Unfortunately, neofetch has stopped development, meaning that its outputs are not guaranteed to be true
            and it's bug fixes have been put on hold indefinitely. Regardless, I still use neofetch just to taste the nostalgia, and to remember how good we had it.
          </p>

          <h2 id='cli-visualizer'>cli-visualizer</h2>
          <p>
            <a target="_blank" href='https://github.com/dpayne/cli-visualizer'>cli-visualizer</a> is
            a TUI audio visualizer majorly written in C++. It listens to your audio output, defines its waveform, and then displays animations that are reactive to volumne, cadence, etc. 
            It has a couple of modes (and also can simulate 
            the <a target="_blank" href='https://en.wikipedia.org/wiki/Lorenz_system'>Lorenz attractor</a>, go figure),
            but I just use it to look cool and to rice out :) . It uses the curses library to render the imagery, and is pretty optimized. Nothing more to say other
            than to check it out.
          </p>

          <h2 id='lazyvim'>lazyvim</h2>
          <p>
            <a target="_blank" href='http://www.lazyvim.org/'>lazyvim</a> is
            the one application that I recommend anyone who is trying to be productive and use their time wisely to learn. Lazyvim is essentially a pre-compiled
            build of NeoVim, with all of the doohickeys and gadgets you could ever ask for, while also staying with the typical norms of NeoVim.
            Lazyvim takes away the burdens of learning about the wild assortment of plugin managers and plugins you could be using with NeoVim,
            and instead allows you to spend your time learning what's important: vim keybindings. Vim keybindings have gotten me out of more binds
            than I can count, and a lot of archaic applications still accept vim keybindings. Once you learn vim, you will never go back.
          </p>

          <h2 id='bumblebee-status'>bumblebee-status</h2>
          <p>
            <a target="_blank" href='https://github.com/tobi-wan-kenobi/bumblebee-status'>bumblebee-status</a> is
            a extremely versatile taskbar framework that works (for the most part) out of the box. 
            There's a large amount of built-in libraries that should house every conceivable functionality you might like.
            Even if you want some niche output for your special taskbar, 
            the <a target="_blank" href='https://bumblebee-status.readthedocs.io/en/latest/'>documentation</a> online
            is really accessible in terms of creating your own "modules"
            (the sections on the status bar). As long as your drivers are working properly, then bumblebee-status can work properly as well.
          </p>
          <p>
            PS: Everything in my rice came out of the box.
          </p>
        
          <h1>Libraries/Frameworks Not Mentioned</h1>
          <h2 id='wallhaven.cc'>wallhaven.cc</h2>
          <p>
            <a target="_blank" href='https://www.wallhaven.cc'>wallhaven</a> is
            a website catalogue of lots of amazing high-quality wallpapers for both desktop and mobile. With my current i3 setup, I've set it such that every reload of
            i3 will download a fresh wallpaper from their website (free API). Although their catalogue includes both SFW and NSFW content, their filters make it
            really easy to find what you're looking for.
          </p>

          <h2 id='pywal'>pywal</h2>
          <p>
            <a target="_blank" href='https://github.com/dylanaraps/pywal'>pywal</a> is
            what cinches my whole setup together. It is a color palette generator based on the current background image. So, when I refresh my i3 and receive a new wallpaper from wallhaven.cc, pywal will reactively generate the latest color palette and apply it to my system palette.
            This allows for literally any application on my computer to utilize the palette and thus reactively match my background. Works like a charm and
            something I recommend for anyone who is getting into ricing.
          </p>
        </div>
        <div className="backToHome">
        <Link href="/" className="button">
          Return to Home
        </Link>
        </div>
        <footer className="contactInfo">
          <p>Copyright © 2024 Isaac Chacko</p>
        </footer>
      </div>

    </>
  );
}
