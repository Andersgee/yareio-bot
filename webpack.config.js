const path = require('path');
const webpack = require('webpack');
const fs = require("fs");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
	entry: './src/index.ts',
	module: {
		rules: [
			{
				test: /\.[jt]sx?$/,
				use: 'babel-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js']
	},
	output: {
		publicPath: '/dist/',
		filename: 'bot.js',
		path: path.resolve(__dirname, 'dist/')
	},
	devtool: false,
	target: "web",
	plugins: [
		new webpack.BannerPlugin({
			banner: fs.readFileSync('./src/options.js').toString(),
			raw: true
		}),
		new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1,
		}),
		new ForkTsCheckerWebpackPlugin({
			typescript: {
				diagnosticOptions: {
					semantic: true,
					syntactic: true,
				},
			},
			eslint: {
				enabled: true,
				files: '.'
			}
		}),
		new webpack.NoEmitOnErrorsPlugin()
	],
	optimization: {
		emitOnErrors: false
	}
};
