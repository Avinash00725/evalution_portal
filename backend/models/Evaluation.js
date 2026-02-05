import mongoose from 'mongoose';

const questionScoreSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  }
}, { _id: false });

const roundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
    enum: [1, 2]
  },
  questions: [questionScoreSchema],
  totalScore: {
    type: Number,
    default: 0
  }
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Judge',
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['poster-presentation', 'paper-presentation', 'startup-expo']
  },
  rounds: [roundSchema],
  remarks: {
    type: String,
    trim: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  evaluatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

evaluationSchema.pre('save', function(next) {
  this.rounds.forEach(round => {
    round.totalScore = round.questions.reduce((sum, q) => sum + q.score, 0);
  });
  this.totalScore = this.rounds.reduce((sum, round) => sum + round.totalScore, 0);
  next();
});

evaluationSchema.index({ team: 1, judge: 1 }, { unique: true });

export default mongoose.model('Evaluation', evaluationSchema);
