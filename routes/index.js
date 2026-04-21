var express = require('express');
var router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cougplace@gmail.com",
    pass: "oizrnxoqkdlqzsbw"
  }
});

let users = [];
let pendingUser = {};

router.get('/', function(req, res, next) {
  res.redirect('/login');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/signup', function(req, res) {
  res.render('signup');
});

router.get('/marketplace', function(req, res, next) {

  const allowedSections = [
    'marketplace',
    'search-results',
    'item-details',
    'profile',
    'edit-profile',
    'change-password',
    'seller-dashboard',
    'create-listing',
    'seller-messages',
    'report-listing',
    'become-seller'
  ];

  let section = req.query.section || 'marketplace';

  if (!allowedSections.includes(section)) {
    section = 'marketplace';
  }

  res.render('index', {
    title: 'CougPlace',
    section: section
  });
});

router.post('/signup', function(req, res) {

  const { firstName, lastName, email, gender, age } = req.body;

  let errors = [];

  if (Number(age) < 18) {
    errors.push("You must be 18 or older.");
  }

  if (!email.endsWith('.edu')) {
    errors.push("Email must contain \".edu\"");
  }

  if (errors.length > 0) {
    return res.render('signup', { error: errors[0] });
  }

  const code = Math.floor(100000 + Math.random() * 900000);

  pendingUser[email] = {
    code: code,
    firstName,
    lastName,
    gender,
    age: Number(age)
  };

  console.log("Pending user:", pendingUser);

  transporter.sendMail({
    from: "cougplace@gmail.com",
    to: email,
    subject: "Verify CougPlace account!",
    text: `Your code is: ${code}`
  }, (err, info) => {

    if (err) {
      console.log("Email error:", err);
      return res.send("Error sending email.");
    }

    return res.render('verify', { email });
  });

});

router.get('/verify', function(req, res) {
  res.render('verify');
});

router.post('/verify', function(req, res) {

  const { email, code } = req.body;

  if (!pendingUser[email]) {
    return res.send("No pending account found.");
  }

  if (pendingUser[email].code !== Number(code)) {
    return res.send("Invalid code.");
  }

  users.push(pendingUser[email]);
  delete pendingUser[email];

  return res.redirect('/login');
});

module.exports = router;