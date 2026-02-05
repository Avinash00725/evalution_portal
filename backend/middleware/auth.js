import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Judge from '../models/Judge.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'judge') {
        req.user = await Judge.findById(decoded.id).select('-password');
      }

      req.userRole = decoded.role;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

export const judgeOnly = (req, res, next) => {
  if (req.user && req.userRole === 'judge') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Judge only.' });
  }
};
