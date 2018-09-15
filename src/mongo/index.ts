import * as fs from "fs";
import * as mongoose from "mongoose";
import * as path from "path";

mongoose.set("useCreateIndex", true);
mongoose.connect(
	process.env.MONGO_URI,
	{ useNewUrlParser: true },
);
(mongoose as any).Promise = global.Promise;

const basename = path.basename(module.filename);
const db: any = {};

fs.readdirSync(__dirname)
	.filter((file: any) => {
		return file.indexOf(".") !== 0 && file !== basename;
	})
	.forEach((file: any) => {
		if (file.slice(-3) !== ".js") {
			return;
		}
		const model = require(`./${file}`)(mongoose);
		db[model.modelName] = model;
	});

const mongo = mongoose.connection;

mongo.on("error", (err: any) => {
	console.error("Connection error:", err.message);
});

mongo.once("open", async function callback() {
	await db.mac.updateMany(
		{
			connected: true,
		},
		{
			connected: false,
		},
	);
	console.log("Connected to DB!");
});

export { db };
