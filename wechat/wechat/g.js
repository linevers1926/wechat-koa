'user strict'

var sha1 = require('sha1')
var Promise = require('bluebird')
//对request进行promise化
var request = Promise.promisify(require('request'))
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var API = {
	accessTokenUrl: prefix + 'token?grant_type=client_credential'
}

function WeChat(ops) {
	var that = this;
	this.appID = ops.appID;
	this.appSecret = ops.appSecret;
	this.getAccessToken = ops.getAccessToken
	this.saveAccessToken = ops.saveAccessToken

	this.getAccessToken()
		.then(function(data) {
			try {
				data = JSON.parse(data);
			} catch(e) {
				return that.updateAccessToken(data);
			}

			if (that.isValidAccessToken(data)) {
				return Promise.resolve(data);
			} else {
				return that.updateAccessToken();
			}
		})
		.then(function(data) {
			console.log(data);
			that.access_token = data.access_token;
			that.expires_in = data.expires_in;

			that.saveAccessToken(data);
		})
}

WeChat.prototype.isValidAccessToken = function(data) {
	if (!data || !data.access_token || !data.expires_in) {
		return false;
	}
	var access_token = data.access_token;
	var expires_in = data.expires_in;
	var now = new Date().getTime();
	if (now < expires_in) {
		return true;
	}
	else {
		return false;
	}
}

WeChat.prototype.updateAccessToken = function(){
	var appID = this.appID;
	var appSecret = this.appSecret;
	var url = API.accessTokenUrl + '&appid='+appID+'&secret='+appSecret;
	return new Promise(function(resolve, reject) {
		request({url: url, json:true}).then(function(response) {
			var data = response.body;
			console.log(data);
			var now  = new Date().getTime();
			var expires_in = now + (data.expires_in-20)*1000;
			data.expires_in = expires_in;
			resolve(data);
		})
	})

}
//&appid=APPID&secret=APPSECRET
//中间件 generator
module.exports = function(config) {
	var wechat = new WeChat(config);
	return function *(next) {
		var token = config.token;
		var signature = this.query.signature;
		var nonce = this.query.nonce;
		var timestamp = this.query.timestamp;
		var echostr = this.query.echostr;
		var str = [token, timestamp, nonce].sort().join('');
		var sha = sha1(str)

		if (sha === signature) {
			this.body = echostr + '';
		} else {
			this.body = 'wrong';
		}
	}	
}

