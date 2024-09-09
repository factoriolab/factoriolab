/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github',
    '@semantic-release/npm',
    [
      'semantic-release-discord-bot',
      {
        notifications: [
          {
            branch: 'main',
          },
        ],
      },
    ],
    [
      '@semantic-release/exec',
      {
        successCmd: 'echo "DEPLOY=true" >> "$GITHUB_ENV"',
      },
    ],
  ],
};
