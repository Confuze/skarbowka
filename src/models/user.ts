import { Schema, model } from "mongoose";

const userSchema = new Schema({
	userId: { type: String, required: true },
	guildId: { type: String, required: true },
	cash: { type: Number, required: true },
	bank: { type: Number, required: true }
});

const userModel = model("User", userSchema);

export default userModel;
