'use strict'

var Koa = require('koa')
var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')
var wechat_file = path.join(__dirname, './config/wechat.txt');
console.log(util);
var config = {
	wechat: {
		appID: 'wxb3080423ca727a96',
		appSecret: 'd4624c36b6795d1d99dcf0547af5443d',
		token: 'linevers',
		getAccessToken: function() {
			return util.readFileAsync(wechat_file)
		},
		saveAccessToken: function(data) {
			data = JSON.stringify(data);
			return util.writeFileAsync(wechat_file, data);
		}
	}

};
var app = new Koa()

app.use(wechat(config.wechat));

app.listen(8080)

console.log('listening : 8080');