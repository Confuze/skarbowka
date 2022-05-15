import { Schema, model } from "mongoose";

interface IUser {
	userId: string
	guildId: string
	cash: number
	bank: number
}

const userSchema = new Schema<IUser>({
	userId: { type: String, required: true },
	guildId: { type: String, required: true },
	cash: { type: Number, required: true },
	bank: { type: Number, required: true }
});

const UserModel = model<IUser>("User", userSchema);

export default UserModel;
