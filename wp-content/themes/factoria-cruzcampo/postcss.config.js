module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-simple-vars'),
    require('@lehoczky/postcss-fluid')({ min: '500px', max: '1100px' }),
    require('postcss-nested'),
    require('autoprefixer'),
    require('postcss-minify'),
  ],
};
