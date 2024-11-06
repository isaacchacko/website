
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Portfolio.module.css';
import PortfolioSignature from '/components/signatures/PortfolioSignature'
import '/app/globals.css';

export default function About() {
  return (
    <>
      <Head>
        Portfolio
      </Head>

      <div className="container">
        <div className="titleSignatureContainer">
          <PortfolioSignature />
        </div>
        <div className={styles.bioContainer}>
          <div className={styles.bioLeft}>
            <div className={styles.bioText}>
              <h1 className={styles.name}>Engineering Honors, Computer Science</h1>
              <p className={styles.bio}>
                insert portfolio content here
              </p>
            </div>
            <Link href="/" className="button">
              Back to Home
            </Link>
          </div>
        </div>
        <footer className="contactInfo">
          <p>Copyright © 2024 Isaac Chacko</p>
        </footer>
      </div>

    </>
  );
}
