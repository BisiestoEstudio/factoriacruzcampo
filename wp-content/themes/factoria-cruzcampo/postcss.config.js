module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-simple-vars'),
    require('@lehoczky/postcss-fluid')({ min: '1100px', max: '500px' }),
    require('postcss-nested'),
    require('autoprefixer'),
    require('postcss-minify'),
  ],
};
