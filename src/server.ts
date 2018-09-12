declare var process: {
		env: {
				MQTT_REDIS_PORT: string;
				MQTT_REDIS_HOST: string;
				MQTT_MOSCA_PORT: number;
				MQTT_MOSCA_ID: string;
		},
	};
import * as Debug from "debug";
const debug: any = Debug("mqtt:server");

require("dotenv").config();
const mosca = require("mosca");
const authorizer = require("./lib/authorizer");

const pubsubBackend = {
		type: "redis",
		redis: require("redis"),
		host: process.env.MQTT_REDIS_HOST,
		port: process.env.MQTT_REDIS_PORT,
};

const moscaSetting = {
		port: process.env.MQTT_MOSCA_PORT - 0,
		id: process.env.MQTT_MOSCA_ID,
		backend: pubsubBackend,
};

const server = new mosca.Server(moscaSetting);

// method
server.on("clientConnected", (client: any) => {
		debug("onl:", client.id);
		publish(client.id, true);
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
		server.authenticate = authorizer.authenticate;
		server.authorizePublish = authorizer.authorizePublish;
		server.authorizeSubscribe = authorizer.authorizeSubscribe;
});

function publish(id: any, state: any) {
		if (/^[A-F0-9]{12}$/.test(id)) {
				const message = {
						topic: `$SYS/${moscaSetting.id}/clients/state`,
						payload: JSON.stringify({
								mac: id,
								time: Date.now(),
								connected: state,
						}),
						qos: 1,
						retain: false,
				};

				server.publish(message, () => {
						debug("server publish:", `clients ${id} connected ${state}!`);
				});
		}
}
