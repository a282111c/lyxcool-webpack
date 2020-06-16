const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const { resolve } = require('path')
const resolvePath = (relativePath) => resolve(process.cwd(), relativePath)
const Dotenv = require('dotenv')
const envPath = path.resolve(process.cwd(), 'env')
const NODE_ENV = process.env.NODE_ENV || 'development'
Dotenv.config({
  path: `${envPath}/common.env`,
})

Dotenv.config({
  path: `${envPath}/${NODE_ENV}.env`,
})

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin');
const DotenvWebpack = require('dotenv-webpack')
const productionConfig = require('./webpack.prod.conf.js')
const developmentConfig = require('./webpack.dev.conf.js')

const commonDot = new DotenvWebpack({
  path: `${envPath}/common.env`,
  systemvars: true,
})

const nodeEnvDot = new DotenvWebpack({
  path: `${envPath}/${NODE_ENV}.env`,
  systemvars: true,
})

const webpackConfig = env => ({
  entry: {},
  output: {
    publicPath: env === 'development' ? '/' : '/',
    path: resolvePath('dist'),
    filename: env === 'development' ? 'js/[name]-[hash:5].bundle.js' : 'js/[name].[chunkhash:8].js',
    chunkFilename: env === 'development' ? 'js/[name]-[hash:5].chunk.js' : 'js/[name].[chunkhash:8].js',
  },
  module: {
    rules: [
      // {
      //   test: /\.(js|jsx)$/,
      //   enforce: 'pre',
      //   loader: 'eslint-loader',
      //   exclude: /node_modules/,
      // },
      { test: /\.js$/, exclude: /(node_modules)/, use: ['babel-loader'] },
      {
        test: /\.css$/,
        use: [
          env === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          env === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('autoprefixer')({
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9',
                  ],
                }),
              ],
            },
          },
          {
            loader: 'less-loader',
            options: {
              modifyVars: {
                'primary-color': '#1DA57A;',
                'link-color': '#1DA57A;',
                'border-radius-base': '2px',
              },
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.(jp[e]?g|png|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[ext]',
              outputPath: 'images/',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.less', '.css'],
    alias: {
      '~': resolvePath('src/'),
      '@': resolvePath('src/component/'),
    },
  },
  mode: env === 'development' ? 'development' : 'production',
  optimization: {},
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolvePath('src/index.html'),
      favicon: resolvePath('src/images/favicon.ico'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru|zh-cn|en/),
    new ProgressBarPlugin(),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true
    }),
    commonDot,
    nodeEnvDot,
  ],
})

module.exports = env => {
  const config = env === 'production' ? productionConfig : developmentConfig
  return merge(webpackConfig(env), config)
}