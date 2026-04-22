var express = require('express');
const nodemailer = require("nodemailer");
const { setDefaultHighWaterMark } = require('nodemailer/lib/xoauth2');

var router = express.Router();

/* Email that will be sending the verification codes. */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cougplace@gmail.com",
    pass: "oizrnxoqkdlqzsbw"
  }
});

let users = [];
let pendingUser = {};

/* In-memory listings */
let listings = [
  {
    id: 1,
    title: "Calculus Textbook",
    description: "Good condition, used for Math 171.",
    category: "Textbooks",
    price: 45,
    pickupArea: "CUB",
    image: "https://via.placeholder.com/400x250",
    status: "Active",
    sellerName: "Alex Johnson",
    sellerEmail: "alex@wsu.edu"
  },
  {
    id: 2,
    title: "Mini Fridge",
    description: "Perfect for dorm rooms. Works great.",
    category: "Dorm Supplies",
    price: 60,
    pickupArea: "Library",
    image: "https://via.placeholder.com/400x250",
    status: "Active",
    sellerName: "Alex Johnson",
    sellerEmail: "alex@wsu.edu"
  },
  {
    id: 3,
    title: "TI-84 Calculator",
    description: "Lightly used. Great for engineering classes.",
    category: "School Supplies",
    price: 70,
    pickupArea: "Spark",
    image: "https://via.placeholder.com/400x250",
    status: "Active",
    sellerName: "Alex Johnson",
    sellerEmail: "alex@wsu.edu"
  }
];

/* DIRECT TO login page */
router.get('/', function(req, res, next) {
  res.redirect('/login');
});

/* GET login */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* POST Login */
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

  req.session.user = user;
  return res.redirect('/marketplace');
});

/* GET signup */
router.get('/signup', function(req, res) {
  res.render('signup');
});

/* GET Marketplace / all sections */
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

  const q = (req.query.q || "").trim().toLowerCase();
  let filteredListings = listings;

  if (q) {
    filteredListings = listings.filter(listing =>
      listing.title.toLowerCase().includes(q) ||
      listing.description.toLowerCase().includes(q) ||
      listing.category.toLowerCase().includes(q)
    );
  }

  const listingId = Number(req.query.id);
  const selectedListing =
    listings.find(l => l.id === listingId) ||
    listings.find(l => l.status === "Active") ||
    listings[0] ||
    null;

  const activeListings = listings.filter(l => l.status === "Active");
  const soldListings = listings.filter(l => l.status === "Sold");
  const draftListings = listings.filter(l => l.status === "Draft");

  res.render('index', {
    title: 'CougPlace',
    section,
    listings: activeListings,
    filteredListings,
    selectedListing,
    sellerListings: listings,
    activeCount: activeListings.length,
    soldCount: soldListings.length,
    draftCount: draftListings.length,
    q
  });
});

/* NEW: POST create listing */
router.post('/marketplace/listings', function(req, res) {
  const {
    title,
    description,
    category,
    price,
    pickupArea,
    image,
    status
  } = req.body;

  if (!title || !description || !category || !price || !pickupArea) {
    return res.redirect('/marketplace?section=create-listing');
  }

  const newListing = {
    id: listings.length ? listings[listings.length - 1].id + 1 : 1,
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    price: Number(price),
    pickupArea: pickupArea.trim(),
    image: image && image.trim() !== "" ? image.trim() : "https://via.placeholder.com/400x250",
    status: status || "Active",
    sellerName: req.session.user
      ? `${req.session.user.firstName} ${req.session.user.lastName}`
      : "Bucky Student",
    sellerEmail: req.session.user ? req.session.user.email : "bucky@wsu.edu"
  };

  listings.unshift(newListing);

  if (newListing.status === "Draft") {
    return res.redirect('/marketplace?section=seller-dashboard');
  }

  return res.redirect('/marketplace?section=marketplace');
});

/* OPTIONAL: mark listing as sold */
router.post('/marketplace/listings/:id/sold', function(req, res) {
  const id = Number(req.params.id);
  const listing = listings.find(l => l.id === id);

  if (listing) {
    listing.status = "Sold";
  }

  res.redirect('/marketplace?section=seller-dashboard');
});

/* OPTIONAL: delete listing */
router.post('/marketplace/listings/:id/delete', function(req, res) {
  const id = Number(req.params.id);
  listings = listings.filter(l => l.id !== id);
  res.redirect('/marketplace?section=seller-dashboard');
});

/* POST Signup */
router.post('/signup', function(req, res) {
  const { firstName, lastName, email, gender, age, password } = req.body;

  let errors = [];

  if (Number(age) < 18) {
    errors.push("You must be 18 or older.");
  }

  if (!email.endsWith('.edu')) {
    errors.push('Email must contain ".edu"');
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