import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    feedUrl: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    isHealthy: {
      type: Boolean,
      default: true,
    },
    lastFetched: {
      type: Date,
    },
    lastErrorMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Source = mongoose.model('Source', sourceSchema);
export default Source;
