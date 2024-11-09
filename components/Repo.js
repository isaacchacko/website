'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const Repo = ({ username, repoName }) => {
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepoDetails = async () => {
      try {
        const [repoData, languages, commits, readme] = await Promise.all([
          axios.get(`https://api.github.com/repos/${username}/${repoName}`),
          axios.get(`https://api.github.com/repos/${username}/${repoName}/languages`),
          axios.get(`https://api.github.com/repos/${username}/${repoName}/commits`),
          axios.get(`https://raw.githubusercontent.com/${username}/${repoName}/master/README.md`)
        ]);

        const totalLines = Object.values(languages.data).reduce((sum, lines) => sum + lines, 0);
        const lastCommitDate = new Date(commits.data[0].commit.author.date).toLocaleDateString();
        const readmeExcerpt = readme.data.substring(0, 200) + '...';

        setRepo({
          ...repoData.data,
          totalLines,
          lastCommitDate,
          readmeExcerpt
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRepoDetails();
  }, [username, repoName]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!repo) return <div>No repository data found</div>;

  return (
    <div>
      <h1>Repository Details: {username}/{repoName}</h1>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
        <h2>{repo.name}</h2>
        <p><strong>Description:</strong> {repo.description || 'No description provided'}</p>
        <p><strong>Total Lines of Code:</strong> {repo.totalLines}</p>
        <p><strong>Last Commit:</strong> {repo.lastCommitDate}</p>
        <p><strong>Stars:</strong> {repo.stargazers_count}</p>
        <p><strong>Forks:</strong> {repo.forks_count}</p>
        <h3>README Excerpt:</h3>
        <p>{repo.readmeExcerpt}</p>
      </div>
    </div>
  );
};

export default Repo;
