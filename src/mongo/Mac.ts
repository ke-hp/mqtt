module.exports = (mongoose: any) => {
	const Model = mongoose.model(
		"mac",
		new mongoose.Schema({
			ap: {
				type: Number,
			},
			company: {
				type: String,
			},
			connected: {
				default: false,
				type: Boolean,
			},
			mac: {
				required: true,
				type: String,
				unique: true,
			},
			sta: {
				type: Number,
			},
			time: {
				type: Date,
			},
			type: {
				type: Number,
			},
			ver: {
				type: String,
			},
		}),
	);
	return Model;
};
