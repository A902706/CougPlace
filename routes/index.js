var express = require('express');
const nodemailer = require("nodemailer");
const { setDefaultHighWaterMark } = require('nodemailer/lib/xoauth2');

var router = express.Router();

/*Email that will be sending the verification codes.*/
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cougplace@gmail.com",
    pass: "oizrnxoqkdlqzsbw"
  }
});

let users = [];
let pendingUser = {};

/*DIRECT TO login page*/
router.get('/', function(req, res, next) {
  res.redirect('/login');
});

/*GET login*/
router.get('/login', function(req, res, next) {
  res.render('login');
});

/*POST Login*/
router.post('/login', function(req, res) {

  const { email, password } = req.body;

  const cEmail = email.toLowerCase();
  const user = users.find(u => u.email === cEmail);

  if (!user) {
    return res.render('login', { error: "User not found" });
  }

  if (user.password !== password) {
    return res.render('login', { error: "Incorrect password" });
  }

  return res.redirect('/marketplace');
});

/*GET signup */
router.get('/signup', function(req, res) {
  res.render('signup');
});

/*GET Marketplace */
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

/*POST Signup */
router.post('/signup', function(req, res) {

  const { firstName, lastName, email, gender, age, password} = req.body;

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

  const cEmail = email.toLowerCase();

  pendingUser[cEmail] = {
    code: code,
    firstName,
    lastName,
    gender,
    age: Number(age),
    password: password
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

  users.push({
    email: email,
    firstName: pendingUser[email].firstName,
    lastName: pendingUser[email].lastName,
    gender: pendingUser[email].gender,
    age: pendingUser[email].age,
    password: pendingUser[email].password
  });

  delete pendingUser[email];

  return res.redirect('/login');
});

module.exports = router;