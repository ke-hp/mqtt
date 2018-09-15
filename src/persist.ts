import * as Debug from "debug";
const debug: any = Debug("ana:persist");
import { db as mongos } from "./mongo/index";

async function persist(topic: any, message: any) {
	debug("Enter persist method!");

	const topics = topic.split("/");

	switch (topics[1]) {
		case process.env.MQTT_MOSCA_ID:
			const msg = JSON.parse(message);
			console.log("message", msg);

			if (/^[A-F0-9]{12}$/.test(msg.mac)) {
				if (!msg.connected) {
					await disconnect(topics, msg);
				}
				await connectedHistory(topics, msg);
			}
			break;

		case "sysinfo":
			await sysinfo(topics, message);
			break;

		case "exec":
			await exec(topics, message);
			break;

		default:
			break;
	}
}

async function disconnect(topics: any, msg: any) {
	debug("Enter connect method!");

	try {
		await mongos.mac.findOneAndUpdate(
			{
				mac: msg.mac,
			},
			{
				connected: false,
			},
		);
		return;
	} catch (error) {
		debug(error);
		return;
	}
}

async function connectedHistory(topics: any, msg: any) {
	debug("Enter connected history method!");

	try {
		await mongos.connectedHistory.create(msg);
		return;
	} catch (error) {
		return;
	}
}

async function exec(topics: any, message: any) {
	debug("Enter exec method!");

	const msg = JSON.parse(message.toString());

	try {
		if (topics[2] === "cmd") {
			const data = {
				cmd: msg.data,
				mac: topics[0],
				timestamp: msg.id,
				user: msg.user,
			};
			await mongos.exec.create(data);
		}
		return;
	} catch (error) {
		debug(error);
		return;
	}
}

async function sysinfo(topics: any, message: any) {
	debug("Enter sysinfo method!");

	const msg = JSON.parse(message.toString());
	if (!/^[A-F0-9]{12}$/.test(topics[0])) {
		return;
	}

	try {
		switch (topics[3]) {
			case "station":
				await mongos.mac.findOneAndUpdate(
					{
						mac: topics[0],
					},
					{
						ap: msg.detail.length,
						connected: true,
						sta: msg.stanum_2g + msg.stanum_5g,
					},
					{
						upsert: true,
					},
				);

				break;

			default:
				const data = {
					keyWord: topics[0] + topics[3] + msg.timestamp,
					mac: topics[0],
					payload: msg,
					timestamp: Math.floor(Date.now() / 1000),
					topic: topics[3],
				};
				await mongos.sysInfo.create(data);
				break;
		}
		return;
	} catch (error) {
		debug(error);
		return;
	}
}
export { persist };
