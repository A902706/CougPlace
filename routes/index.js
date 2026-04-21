var express = require('express');
var router = express.Router();

/*Store current users*/
let users = [];

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

router.post('/signup', function(req, res) {

  const { firstName, lastName, email, gender, age } = req.body;

  let errors = [];

  // Age check
  if (age < 18) {
    errors.push("You must be 18 or older.");
  }

  // .edu email check
  if (!email.endsWith('.edu')) {
    errors.push("Email must contain \".edu\"");
  }

    // Store data so user doesnt have to reinput it.
  users.push({
    firstName,
    lastName,
    email,
    gender,
    age
  });

  if (errors.length > 0) {
    return res.render('signup', { error: errors[0] });
  }

  // Print details.
  console.log(users)

  // Redirect to login page
  return res.redirect('/login')
});

module.exports = router;