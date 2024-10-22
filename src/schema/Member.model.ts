import mongoose, { Schema } from "mongoose";
import { MemberType, MemberStatus } from "../libs/enums/member.enum";

// Schema first & Code first (two ways of using schemas)

const memberSchema = new Schema(
  {
    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER, // Default member type is USER
    },

    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE, // Default member status is ACTIVE
    },

    memberNick: {
      type: String,
      index: { unique: true, sparse: true }, // Index: nickname should be unique
      required: true,
    },

    memberPhone: {
      type: String,
      index: { unique: true, sparse: true }, // Index: phone number should be unique
      required: true, // Phone number is required
    },

    memberPassword: {
      type: String,
      select: false, // By default, no autofill for password
      required: true, // Password is required
    },

    memberAddress: {
      type: String,
    },

    memberDesc: {
      type: String,
    },

    memberImage: {
      type: String,
    },

    memberPoints: {
      type: Number,
      default: 0, // Default member points is 0
    },
  },
  { timestamps: true } // createdAt and updatedAt timestamps
);

// Creating schema model
export default mongoose.model("Member", memberSchema); // Export the schema model
