const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
  userAgent: 'DevArena/1.0.0',
  request: {
    timeout: 5000,
  },
});

module.exports = octokit;