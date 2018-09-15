module.exports = (mongoose: any) => {
		const Model = mongoose.model("sysInfo", new mongoose.Schema({
				keyWord: {
						required: true,
						type: String,
						unique: true,
				},
				mac: {
						required: true,
						type: String,
				},
				payload: {},
				timestamp: {
						required: true,
						type: String,
				},
				topic: {
						type: String,
				},
		}));
		return Model;
};
