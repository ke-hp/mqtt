import * as DEBUG from "debug";
const debug: any = DEBUG("mqtt:auth");

const authenticate: any = (
	client: any,
	username: any,
	password: any,
	callback: any,
) => {
	console.log(username);
	console.log(password);
	debug("authenticate:", client.id);
	let flag = false;

	if (username != null && username.length > 0) {
		client.super_user = false;
		flag = true;

		if (
			username === process.env.MQTT_USERNAME &&
			password === process.env.MQTT_PASSWORD
		) {
			client.super_user = true;
		}
	} else {
		// check format as macaddr
		flag = /^[A-F0-9]{12}$/.test(client.id);
	}

	// console.log("111111111111111111", client);
	console.log("111111111111111111", username);
	console.log("111111111111111111", password);
	console.log("111111111111111111", flag);
	callback(null, flag);
};

const authorizePublish: any = (
	client: any,
	topic: any,
	payload: any,
	callback: any,
) => {
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
	console.log("client.super_user", client.super_user);
	console.log("client.id", client.id);
	console.log("tops.length", client.super_user);
	console.log("tops", tops);
	console.log("22222222222222222222", topic);
	// console.log("22222222222222222222", callback);
	console.log("22222222222222222222", flag);

	callback(null, flag);
};

const authorizeSubscribe: any = (client: any, topic: any, callback: any) => {
	let flag = false;
	const tops = topic.split("/");

	if (client.super_user || client.id === tops[0]) {
		flag = true;
	} else if (tops.length >= 3 && "kp" === tops[0] && client.id === tops[1]) {
		flag = true;
	} else if (tops.length >= 3 && "kp" === tops[0] && "FFFFFFFFFFFF" === tops[1]) {
		flag = true;
	}
	// console.log("3333333333333333333333", client);
	console.log("3333333333333333333333", topic);
	console.log("3333333333333333333333", flag);

	callback(null, flag);
};

export { authenticate, authorizePublish, authorizeSubscribe };
