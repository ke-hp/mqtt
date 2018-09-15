module.exports = (mongoose: any) => {
	const Model = mongoose.model(
		"exec",
		new mongoose.Schema({
			cmdcmd: {
				required: true,
				type: String,
			},
			mac: {
				required: true,
				type: String,
			},
			timestamp: {
				required: true,
				type: String,
				unique: true,
			},
			user: {
				required: true,
				type: String,
			},
		}),
	);
	return Model;
};
