import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['poster-presentation', 'paper-presentation', 'startup-expo']
  },
  members: [{
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: String
  }],
  totalMembers: {
    type: Number,
    default: 0
  },
  description: String,
  selectedForRound2: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

teamSchema.pre('save', function(next) {
  this.totalMembers = this.members.length;
  next();
});

export default mongoose.model('Team', teamSchema);
