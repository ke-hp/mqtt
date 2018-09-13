declare var process: {
	env: {
		MQTT_REDIS_PORT: string;
		MQTT_REDIS_HOST: string;
		MQTT_MOSCA_PORT: number;
		MQTT_MOSCA_ID: string;
	};
};
import * as Debug from "debug";
const debug: any = Debug("mqtt:server");
import * as dotenv from "dotenv";
dotenv.config();
import * as mosca from "mosca";
import {
	authenticate,
	authorizePublish,
	authorizeSubscribe,
} from "./lib/authorizer";

const pubsubBackend = {
	type: "redis",
	redis: require("redis"),
	host: process.env.MQTT_REDIS_HOST,
	port: process.env.MQTT_REDIS_PORT,
};

const moscaSetting = {
	backend: pubsubBackend,
	id: process.env.MQTT_MOSCA_ID,
	port: process.env.MQTT_MOSCA_PORT - 0,
};
// console.log("33333333333333");

const server = new mosca.Server(moscaSetting);

// method
server.on("clientConnected", (client: any) => {
	// console.log("666666666666", client.id);
	debug("onl:", client.id);
	publish(client.id, true);
});

server.on("clientDisconnected", (client: any) => {
	// console.log("3333333333333", client.id);
	debug("off:", client.id);
	publish(client.id, false);
});

server.on("subscribed", (topic: any, client: any) => {
	console.log("222222222222");
	if (client) {
		console.log("33333333333", client.id);
		console.log("11111111111", topic);
		debug("sub:", topic, "for", client.id);
		if (topic === `kp/${client.id}/mosca/status`) {
			// if (/^[A-F0-9]{12}$/.test(client.id) && topic === `${client.id}/exec/#`) {

			const command: any = {uniq: Date.now()};
			const message: any = {
							topic: `kp/${client.id}/mosca/status`,
							payload: JSON.stringify(command),
							qos: 1,
							retain: false,
						};

			setTimeout(() => {
				console.log("222222222222222");
				server.publish(message, () => {
										debug("onl:cmd: done!");
								});
						}, 5000);
				}
	}
});

server.on("published", (packet: any, client: any) => {
	// console.log("00000000000000", client.id);
	if (/^[A-F0-9]{12}$/.test(packet.payload)) {
		debug("published:", packet.topic, packet.payload);
	}
	if (client) {
		debug("pub:", packet.topic, "from", client.id);
	}
});

server.on("ready", () => {
	console.log("Mosca server is up and running");
	server.authenticate = authenticate;
	server.authorizePublish = authorizePublish;
	server.authorizeSubscribe = authorizeSubscribe;
});

function publish(id: any, state: any) {
	if (/^[A-F0-9]{12}$/.test(id)) {
		const message = {
			topic: `$SYS/${moscaSetting.id}/clients/state`,
			payload: JSON.stringify({
				connected: state,
				mac: id,
				time: Date.now(),
			}),
			qos: 1,
			retain: false,
		};

		server.publish(message, () => {
			debug("server publish:", `clients ${id} connected ${state}!`);
		});
	}
}
