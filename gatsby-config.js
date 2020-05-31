module.exports = {
  siteMetadata: {
    title: '日本語勉強',
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: '日本語勉強',
        short_name: '日本語勉強',
        start_url: '/',
        icon: 'src/images/site-logo.png',
      },
    },
  ],
};
