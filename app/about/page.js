
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from './About.module.css';
import AboutSignature from '/components/signatures/AboutSignature'
import '/app/globals.css';

export default function About() {
  return (
    <>
      <Head>
        About
      </Head>

      <div>
        <div className="titleSignatureContainer">
          <AboutSignature />
        </div>
        <div className={styles.bioContainer}>
          <div className={styles.bioLeft}>
            <div className={styles.bioText}>
              <p className={styles.bio}>
                Howdy! I'm Isaac Chacko. I'm a homegrown Houstonian attending Texas A&M University.
              </p>
              <p className={styles.bio}>
                Academically, I'm a President's Endowed National Merit Engineering Honors Freshman pursuing a major in Computer Science and a minor in Mathematics.
              </p>
              <p className={styles.bio}>
                Work wise, I compete in NASA's Lunar Autonomy Challenge, develop for <a href='https://aggieseek.net/'>AggieSEEK</a>, and work as a contributor for the <a href='https://taco-group.github.io/'>TACO Group</a>, currently developing AI video super resolution software with PyTorch.
              </p>
              <p className={styles.bio}>
                For fun, I like to run, play games (board and video), and try all flavors of Blue Bell Ice Cream. My ultimate bucket list item is to visit all of the Great Wonders of the World. <a href='https://docs.google.com/spreadsheets/d/15ZyCRQV3nqTTrNkQFZ3_Nak3hvymi4u1y2ql3w_uu1Y/edit?usp=sharing'>I'm already 8% of the way there!</a>
              </p>
              <p className={styles.bio}>
                Thanks and Gig' Em!
              </p>
            </div>
          </div>
          <div className={styles.profileImageContainer}>
            <Image
              src="/images/profile-picture.jpg"
              alt="Profile Picture"
              width={717}
              height={717}
              layout="responsive"
              objectFit="cover"
              className={styles.profileImage}
            />
          </div>
        </div>
        <div className="backToHome">
        <Link href="/" className="button">
          Back to Home
        </Link>
        </div>
        <footer className="contactInfo">
          <p>Copyright © 2024 Isaac Chacko</p>
        </footer>
      </div>

    </>
  );
}
