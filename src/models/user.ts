import { Schema, model } from "mongoose";

const userSchema = new Schema({
	userId: { type: String, required: true },
	guildId: { type: String, required: true },
	cash: { type: Number, required: true },
	bank: { type: Number, required: true }
});

const User = model("User", userSchema);

export default User;
