module.exports = {
  // ... other config
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/html2pdf\.js/,
          /node_modules\/jspdf/
        ],
      },
    ],
  },
}