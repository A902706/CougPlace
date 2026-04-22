var express = require('express');
const nodemailer = require("nodemailer");
const db = require('../db');

var router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cougplace@gmail.com",
    pass: "oizrnxoqkdlqzsbw"
  }
});

let pendingUser = {};

router.get('/', (req, res) => res.redirect('/login'));

router.get('/login', (req, res) => res.render('login'));

router.post('/login', (req, res) => {
  const cEmail = (req.body.email || "").toLowerCase();

  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(cEmail);

  if (!user) return res.render('login', { error: "User not found" });
  if (user.password !== req.body.password) {
    return res.render('login', { error: "Incorrect password" });
  }

  req.session.user = user;
  res.redirect('/marketplace');
});

router.get('/signup', (req, res) => res.render('signup'));

router.post('/signup', (req, res) => {
  const { firstName, lastName, email, gender, age, password } = req.body;

  if (Number(age) < 18) return res.render('signup', { error: "You must be 18 or older." });
  if (!email.endsWith('.edu')) return res.render('signup', { error: 'Email must contain ".edu"' });

  const code = Math.floor(100000 + Math.random() * 900000);
  const cEmail = email.toLowerCase();

  pendingUser[cEmail] = { code, firstName, lastName, gender, age: Number(age), password };

  transporter.sendMail({
    from: "cougplace@gmail.com",
    to: email,
    subject: "Verify CougPlace account!",
    text: `Your code is: ${code}`
  }, () => {
    res.render('verify', { email });
  });
});

router.get('/verify', (req, res) => res.render('verify'));

router.post('/verify', (req, res) => {
  const { email, code } = req.body;
  const u = pendingUser[email];

  if (!u) return res.send("No pending account found.");
  if (u.code !== Number(code)) return res.send("Invalid code.");

  db.prepare(`
    INSERT INTO users (email, password, firstName, lastName, gender, age)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(email, u.password, u.firstName, u.lastName, u.gender, u.age);

  delete pendingUser[email];

  res.redirect('/login');
});

router.get('/marketplace', requireLogin, (req, res) => {
  const all = db.prepare(`SELECT * FROM listings`).all();

  const active = all.filter(l => l.status === "Active");
  const sold = all.filter(l => l.status === "Sold");
  const draft = all.filter(l => l.status === "Draft");

  const q = (req.query.q || "").trim().toLowerCase();

  let filtered = active;

  if (q) {
    filtered = active.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    );
  }

  const selected =
    all.find(l => l.id === Number(req.query.id)) ||
    active[0] ||
    null;

  const userId = req.session.user.id;
  const sellerListings = db.prepare(`SELECT * FROM listings WHERE userId = ?`).all(userId);

  const sellerActive = sellerListings.filter(l => l.status === "Active");
  const sellerSold = sellerListings.filter(l => l.status === "Sold");
  const sellerDraft = sellerListings.filter(l => l.status === "Draft");

  res.render('index', {
    title: 'CougPlace',
    section: req.query.section || 'marketplace',
    listings: active,
    filteredListings: filtered,
    selectedListing: selected,
    sellerListings: sellerListings,
    activeCount: sellerActive.length,
    soldCount: sellerSold.length,
    draftCount: sellerDraft.length,
    q,
    currentUser: req.session.user,
    error: req.query.error || null,
    success: req.query.success || null
  });
});

router.post('/marketplace/change-password', requireLogin, (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = req.session.user;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.redirect('/marketplace?section=change-password&error=Please fill out all fields');
  }

  if (currentPassword !== user.password) {
    return res.redirect('/marketplace?section=change-password&error=Current password is incorrect');
  }

  if (newPassword !== confirmPassword) {
    return res.redirect('/marketplace?section=change-password&error=New passwords do not match');
  }

  if (newPassword.length < 6) {
    return res.redirect('/marketplace?section=change-password&error=New password must be at least 6 characters');
  }

  db.prepare(`
    UPDATE users
    SET password = ?
    WHERE id = ?
  `).run(newPassword, user.id);

  req.session.user.password = newPassword;

  return res.redirect('/marketplace?section=change-password&success=Password updated successfully');
});

router.post('/marketplace/listings', requireLogin, (req, res) => {
  const u = req.session.user;

  db.prepare(`
    INSERT INTO listings 
    (userId, title, description, category, price, pickupArea, image, status, sellerName, sellerEmail)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    u.id,
    req.body.title,
    req.body.description,
    req.body.category,
    Number(req.body.price),
    req.body.pickupArea,
    req.body.image || "https://via.placeholder.com/400x250",
    req.body.status || "Active",
    `${u.firstName} ${u.lastName}`,
    u.email
  );

  res.redirect('/marketplace');
});

router.post('/marketplace/listings/:id/sold', requireLogin, (req, res) => {
  db.prepare(`
    UPDATE listings SET status = 'Sold'
    WHERE id = ? AND userId = ?
  `).run(req.params.id, req.session.user.id);

  res.redirect('/marketplace?section=seller-dashboard');
});

router.post('/marketplace/listings/:id/delete', requireLogin, (req, res) => {
  db.prepare(`
    DELETE FROM listings 
    WHERE id = ? AND userId = ?
  `).run(req.params.id, req.session.user.id);

  res.redirect('/marketplace?section=seller-dashboard');
});

router.get('/chat', requireLogin, (req, res) => {
  res.render('chat');
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/marketplace');
    }

    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;