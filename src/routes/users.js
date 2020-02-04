const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const db = require('../db/db');
const sendEmail = require('../emails/sendEmail');

const router = express.Router();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') && file.mimetype.match(/(jpeg|jpg|png)$/)) {
    return cb(null, true);
  }
  cb(new Error('Files must be jpeg, jpg, or png'));
}

const limits = {
  fileSize: 1000000,
};

// const storage = multer.diskStorage({
//   filename(req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

const upload = multer({ 
  fileFilter,
  limits,
});



router.post('/', async (req, res, next) => {
  try {
    const dbResponse = await db.create('user', req.body);
    dbResponse.authToken = await dbResponse.user.generateAuthToken();
    // disabling this so I don't get a ton of emails during testing, but it works!
    // sendEmail('signup', dbResponse.user.email, dbResponse.user.name);
    res.status(dbResponse.statusCode).json(dbResponse);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.post('/login', async (req, res, next) => {

  try {
    const dbResponse = await User.findByCredentials(req.body.email, req.body.password);
    if (dbResponse.statusCode > 299) return res.status(dbResponse.statusCode).json(dbResponse);
    dbResponse.authToken = await dbResponse.user.generateAuthToken();
    res.status(dbResponse.statusCode).json(dbResponse);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.get('/profileWithId', (req, res, next) => {
  res.render('profileId');
})

router.get('/:id/avatar', async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.send(404);
  }
  res.set('Content-Type', 'image/png');
  res.send(user.avatar);
});

router.use(auth);

router.post('/me/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    req.user.avatar = await sharp(req.file.buffer).resize(200, 200).png().toBuffer();
    await req.user.save();
    res.status(200).send({ msg: 'File uploaded', user: req.user });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.delete('/me/avatar', async (req, res, next) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).json({ msg: 'Deleted avatar', user: req.user });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.get('/me', async (req, res, next) => {
  res.send(req.user);
});

router.post('/logout', async (req, res, next) => {
  req.user.authTokens = req.user.authTokens.filter(({ token }) => token !== req.authToken);
  try {
    await req.user.save();
    res.json({ msg: 'Logged out', user: req.user });
  } catch (e) {
    res.status(500).json({ msg: 'Error while saving user' });
  }
});

router.post('/logoutAll', async (req, res, next) => {
  req.user.authTokens = [];
  try {
    await req.user.save();
    res.json({ msg: 'Logged out on all devices', user: req.user });
  } catch (e) {
    res.status(500).json({ msg: 'Error while saving user' });
  }
});

router.patch('/me', async (req, res, next) => {
  const dbResponse = await db.updateUser(req.user._id, req.body);
  res.status(dbResponse.statusCode).json(dbResponse);
});

router.delete('/me', async (req, res, next) => {
  // instead of calling the db.delete method, we can simply call the remove() method on the req.user that was setup in the auth middleware. 
  try {
    await req.user.remove();
    // sendEmail('cancel', req.user.email, req.user.name)
    res.send(req.user);
  } catch (e) {
    res.status(500).json({ msg: 'Error removing user', error: e.message });
  }
});

router.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});


module.exports = router;
