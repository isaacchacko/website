
import { FaLinkedin, FaGithub, FaEnvelope, FaFileAlt } from 'react-icons/fa';
import { VscGithubAlt } from 'react-icons/vsc';
import styles from './SocialLinks.module.css';

const SocialLinks = () => {
  return (
    <div className={styles.socialLinks}>
      <a className={styles.has_tooltip} tooltip="LinkedIn" href="https://www.linkedin.com/in/isaacchacko" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <FaLinkedin className={styles.icon} />
      </a>
      <a className={styles.has_tooltip} tooltip="GitHub" href="https://github.com/isaacchacko" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <FaGithub className={styles.icon} />
      </a>
      <a className={styles.has_tooltip} tooltip="Snail Mail" href="mailto:isaac.chacko05@tamu.edu" aria-label="Email">
        <FaEnvelope className={styles.icon} />
      </a>
      <a className={styles.has_tooltip} tooltip="Resume" href="https://drive.google.com/file/d/1-NBdX32Opo2ajMpDpWgXaQkyOQ9KzdcP/view?usp=sharing" target="_blank" rel="noopener noreferrer" aria-label="Résumé">
        <FaFileAlt className={styles.icon} />
      </a>
    </div>
  );
};

export default SocialLinks;
