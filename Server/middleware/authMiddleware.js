import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Generic role checker
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.type)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

// Specific middlewares
export const isUser = (req, res, next) => {
  if (!req.user || (req.user.type !== 'victim' && req.user.type !== 'volunteer')) {
    return res.status(403).json({ message: 'Only users can perform this action' });
  }
  next();
};

export const isVictim = (req, res, next) => {
  if (req.user?.type !== 'victim') {
    return res.status(403).json({ message: 'Only victims allowed' });
  }
  next();
};

export const isVolunteer = (req, res, next) => {
  if (req.user?.type !== 'volunteer') {
    return res.status(403).json({ message: 'Only volunteers allowed' });
  }
  next();
};

/*export const isAdmin = (req, res, next) => {
  const adminTypes = ['Police', 'Army', 'Hospital', 'Redcross', 'NGO', 'Government', 'Other'];
  if (!req.user || !adminTypes.includes(req.user.type)) {
    return res.status(403).json({ message: 'Only admins allowed' });
  }
  next();
};*/

export const isAdmin = (req, res, next) => {
  console.log('User in isAdmin middleware:', req.user);  // 👀

  const adminTypes = ['Police', 'Army', 'Hospital', 'Redcross', 'NGO', 'Government', 'Other'];
  if (!req.user || !adminTypes.includes(req.user.type)) {
    return res.status(403).json({ message: 'Only admins allowed' });
  }
  next();
};


export const isPolice = (req, res, next) => {
  if (req.user?.type !== 'Police') {
    return res.status(403).json({ message: 'Only police allowed' });
  }
  next();
};

export const isArmy = (req, res, next) => {
  if (req.user?.type !== 'Army') {
    return res.status(403).json({ message: 'Only Army allowed' });
  }
  next();
};
