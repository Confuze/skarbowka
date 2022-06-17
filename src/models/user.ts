import { Guild, User } from "discord.js";
import { Schema, model, Model, HydratedDocument } from "mongoose";

interface IUser {
	userId: string
	guildId: string
	cash: number
	bank: number
}

interface UserDocument extends IUser {
	sum: number
}

export interface UserModel extends Model<UserDocument> {
	newDocument(userId:User["id"], guildId:Guild["id"]): Promise<HydratedDocument<IUser, UserDocument>>
	quickFind(userId:User["id"], guildId:Guild["id"]): Promise<HydratedDocument<IUser, UserDocument>>
}

const userSchema = new Schema<IUser, UserModel>({
	userId: { type: String, required: true },
	guildId: { type: String, required: true },
	cash: { type: Number, required: true },
	bank: { type: Number, required: true }
});

userSchema.virtual("sum").get(function () {
	return this.cash + this.bank;
});

userSchema.statics.newDocument = async function (userId:User["id"], guildId:Guild["id"]) {
	const user = new this({
		userId: userId,
		guildId: guildId,
		cash: 0,
		bank: 0
	});

	await user.save();
};

userSchema.statics.quickFind = async function (userId:User["id"], guildId:Guild["id"]) {
	if (!(await this.findOne({ userId: userId, guildId: guildId }))) await this.newDocument(userId, guildId);
	return UserModel.findOne({ userId: userId, guildId: guildId });
};

const UserModel = model<IUser, UserModel>("User", userSchema);

export default UserModel;