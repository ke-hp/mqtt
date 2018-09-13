const debug = require("debug")("mqtt:auth");

module.exports.authenticate = function(client: any, username: any, password: any, callback: any) {
		debug("authenticate:", client.id);
		let flag = false;

		if (username != null && username.length > 0) {
				client.super_user = false;
				flag = true;

				if (username == process.env.MQTT_USERNAME && password == process.env.MQTT_PASSWORD) {
						client.super_user = true;
				}

		} else {
				// check format as macaddr
				flag = /^[A-F0-9]{12}$/.test(client.id);
		}

		callback(null, flag);
};

module.exports.authorizePublish = function(client: any, topic: any, payload: any, callback: any) {
		let flag = false;
		const tops = topic.split("/");

		if (client.super_user || client.id == topic.split("/")[0]) {
				flag = true;
		} else if (tops.length >= 3 && "kp" == tops[0] && client.id == tops[2]) {
				flag = true;
		} else if (tops.length >= 4 && "$SYS" == tops[0] && "broker" == tops[1] && "connection" == tops[2]) {
				flag = true;
		}

		callback(null, flag);
};

module.exports.authorizeSubscribe = function(client: any, topic: any, callback: any) {
		let flag = false;

		if (client.super_user || client.id == topic.split("/")[0]) {
				flag = true;
		}

		callback(null, flag);
};
