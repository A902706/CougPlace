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

/*Store current users*/
let users = [];
let pendingUser = {};
/* GET home page */
router.get('/', function(req, res, next) {
  res.redirect('/login');
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/*GET signUp page */
router.get('/signup', function(req, res) {
  res.render('signup');
});

/*POST after sign up is submitted.*/
router.post('/signup', function(req, res) {

  const { firstName, lastName, email, gender, age } = req.body;

  let errors = [];

  // Age check
  if (Number(age) < 18) {
    errors.push("You must be 18 or older.");
  }

  // .edu email check
  if (!email.endsWith('.edu')) {
    errors.push("Email must contain \".edu\"");
  }

  if (errors.length > 0) {
    return res.render('signup', { error: errors[0] });
  }

  // Generate a code 
  const code = Math.floor(100000 + Math.random() * 900000);

  // Save user
  pendingUser[email] = 
  {
    code: code,
    firstName,
    lastName,
    gender,
    age: Number(age)
  };

  // Print details.
  console.log("Pending user: ", pendingUser);

  // Send email using nodemailer
  transporter.sendMail({
    from: "cougplace@gmail.com",
    to: email,
    subject: "Verify CougPlace account!",
    text: `Your code is: ${code}`
  }, (err, info) => {
    if (err) {
      console.log("Error: ", err);
      return res.send("Error sending email.");
    }

    // Redirect to verify page
    return res.render('verify', { email }); 
  });
  
});

/*GET verify user email.*/
router.get('/verify', function(req, res) {
  res.render('verify');
});

/*POST verify route*/
router.post('/verify', function(req, res) {
  const { email, code } = req.body;

  if(!pendingUser[email])
  {
    return res.send("No pending account found."); // Error state shouldnt get here but just in case
  }

  if( pendingUser[email].code !== Number(code))
  {
    return res.send("Invalid code.");
  }

  users.push(pendingUser[email]);

  delete pendingUser[email];

  return res.redirect('/login');
})
module.exports = router;