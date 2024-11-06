import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import styles from './LandingPage.module.css';
import IsaacChacko from '/components/signatures/IsaacChacko';
import NavButtons from '/components/LandingNavButtons';
import SocialLinks from '/components/SocialLinks';

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div>
        <div className={styles.howdyContainer}>
          <h1 className={styles.howdy}>Howdy! I'm</h1>
          <IsaacChacko />
        </div>
        <SocialLinks />

        <div className={styles.bioContainer}>
          <div className={styles.bioLeft}>
            <div className={styles.bioText}>
              <p className={styles.bio}>
                I'm a freshman Computer Science Major at Texas A&M University. Click around to learn more.
              </p>
            </div>
            <NavButtons />
          </div>
          <div className={styles.profileImageContainer}>
            <Image
              src="/images/profile-picture.jpg"
              alt="Profile Picture"
              layout="fill"
              objectFit="cover"
              className={styles.profileImage}
            />
          </div>
        </div>

        <footer className="contactInfo">
          <p>Copyright © 2024 Isaac Chacko</p>
        </footer>
      </div>
    </> 
  );
}
