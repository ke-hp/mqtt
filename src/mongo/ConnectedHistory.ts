module.exports = (mongoose: any) => {
	const Model = mongoose.model(
		"connectedHistory",
		new mongoose.Schema({
			connected: {
				required: true,
				type: Boolean,
			},
			mac: {
				required: true,
				type: String,

			},
			time: {
				type: Date,
			},
		}),
	);
	return Model;
};
