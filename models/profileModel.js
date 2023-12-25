const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  listEducation: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
});

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  listCompany: [
    {
      nameCompany: { type: String, required: true },
      role: [{ type: String, required: true }],
    },
  ],
});

const profileSchema = mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
    },
    name: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    introduce: {
      type: String,
      required: false,
    },
    educations: { type: educationSchema, required: false },
    experiences: { type: [experienceSchema], requiređ: false },
    skills: {
      type: Array,
      required: false,
    },
  },
  { collection: "profile" }
);

module.exports = mongoose.model("profile", profileSchema);