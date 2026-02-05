import Admin from '../models/Admin.js';
import Judge from '../models/Judge.js';
import generateToken from '../utils/generateToken.js';

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        token: generateToken(admin._id, 'admin'),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginJudge = async (req, res) => {
  try {
    const { email, password } = req.body;

    const judge = await Judge.findOne({ email });

    if (judge && (await judge.matchPassword(password))) {
      if (!judge.isActive) {
        return res.status(403).json({ message: 'Your account has been deactivated' });
      }

      res.json({
        _id: judge._id,
        name: judge.name,
        email: judge.email,
        assignedEvent: judge.assignedEvent,
        role: 'judge',
        token: generateToken(judge._id, 'judge'),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInitialAdmin = async (req, res) => {
  try {
    const adminExists = await Admin.findOne({});
    
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@aisummit.com',
      password: 'admin123',
      isSuper: true
    });

    res.status(201).json({
      message: 'Initial admin created successfully',
      email: admin.email,
      password: 'admin123'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
