import * as dotenv from "dotenv";
dotenv.config();
import * as Debug from "debug";
const debug: any = Debug("mqtt:server");
import * as mqtt from "mqtt";
import { persist } from "./persist";

const client = mqtt.connect(
	process.env.MQTT_URL,
	{
		clientId: process.env.ANA_CLIENT_ID,
		password: process.env.MQTT_PASSWORD,
		username: process.env.MQTT_USERNAME,
	},
);

client.on("connect", () => {
	console.log("ana连接上生产的mqtt");
	debug(">>> connected");
	client.subscribe("+/exec/#");
	client.subscribe("+/sysinfo/report/#");
	client.subscribe(`$SYS/${process.env.MQTT_MOSCA_ID}/clients/state`);
});

client.on("message", async (topic: any, message: any) => {
	debug("message", topic);

	// try {
	await persist(topic, message);
	return;
	// } catch (error) {
	// 	return error;
	// }
});
