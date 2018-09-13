import * as DEBUG from "debug";
const debug: any = DEBUG("mqtt:auth");

const authenticate: any = (
	client: any,
	username: any,
	password: any,
	callback: any,
) => {
	// console.log("2333333333333");
	// console.log("222", client.id);
	debug("authenticate:", client.id);
	let flag = false;

	if (username != null && username.length > 0) {
		client.super_user = false;
		flag = true;

		if (
			username === process.env.MQTT_USERNAME &&
			password.toString() === process.env.MQTT_PASSWORD
		) {
			client.super_user = true;
		}
	} else {
		// check format as macaddr
		flag = /^[A-F0-9]{12}$/.test(client.id);
	}
	flag = true;
	callback(null, flag);
};

const authorizePublish: any = (
	client: any,
	topic: any,
	payload: any,
	callback: any,
) => {
	console.log("222", client.id);
	let flag = false;
	const tops = topic.split("/");

	if (client.super_user || client.id === tops[0]) {
		flag = true;
	} else if (tops.length >= 3 && "kp" === tops[0] && client.id === tops[2]) {
		flag = true;
	} else if (
		tops.length >= 4 &&
		"$SYS" === tops[0] &&
		"broker" === tops[1] &&
		"connection" === tops[2]
	) {
		flag = true;
	}
	flag = true;
	callback(null, flag);
};

const authorizeSubscribe: any = (client: any, topic: any, callback: any) => {
	console.log("222", client.id);
	let flag = false;
	const tops = topic.split("/");

	if (client.super_user || client.id === tops[0]) {
		flag = true;
	} else if (tops.length >= 3 && "kp" === tops[0] && client.id === tops[1]) {
		flag = true;
	} else if (tops.length >= 3 && "kp" === tops[0] && "FFFFFFFFFFFF" === tops[1]) {
		flag = true;
	}
	console.log("2222222", flag);
	flag = true;
	callback(null, flag);
};

export { authenticate, authorizePublish, authorizeSubscribe };
