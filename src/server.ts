declare var process: {
	env: {
		MQTT_REDIS_PORT: string;
		MQTT_REDIS_HOST: string;
		MQTT_MOSCA_PORT: number;
		MQTT_MOSCA_ID: string;
		MQTT_BACKWARD: string;
	};
};
import * as Debug from "debug";
const debug: any = Debug("mqtt:server");
import * as dotenv from "dotenv";
dotenv.config();
import * as mosca from "mosca";
import { isNull } from "util";
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

const server = new mosca.Server(moscaSetting);

// method
server.on("clientConnected", (client: any) => {
	debug("onl:", client.id);
	publish(client.id, true);
	if (!isNull(process.env.MQTT_BACKWARD)) {
		try {
			if (/^[A-F0-9]{12}$/.test(client.id)) {
				const backward: JSON[] = JSON.parse(process.env.MQTT_BACKWARD);
			 backward.forEach((item: any) => {
				const topic: any = item.topic.replace(/MQTT_DEV_MAC_MQTT/g, client.id);
				const payload: string = JSON.stringify(item.payload).replace(/MQTT_SRV_TS_MQTT/g, Date.now().toString());

				const message: any = {
						topic,
						payload,
						qos: 1,
						retain: false,
					};
				setTimeout(() => {
						server.publish(message, () => {
							debug("onl:cmd: done!");
						});
					}, Math.floor(Math.random() * (9999) + 10000));

				});
			}
		} catch (err) {
			console.error("error", "mqtt clientConnected backward", err);
		}
	}

});

server.on("clientDisconnected", (client: any) => {
	debug("off:", client.id);
	publish(client.id, false);
});

server.on("subscribed", (topic: any, client: any) => {
	if (client) {
		debug("sub:", topic, "for", client.id);
	}
});

server.on("published", (packet: any, client: any) => {
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
