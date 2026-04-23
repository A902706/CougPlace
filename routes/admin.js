const express = require('express');
const router = express.Router();
const db = require('../db');

//Require login for admin routes
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// Dashboard
router.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  res.render('admin/dashboard', {
    currentUser: req.session.user
  });
});

// MANAGE USERS 
router.get('/users', (req, res) => {
  const users = db.prepare(`SELECT * FROM users`).all();

  res.render('admin/manageusers', {
    users: users
  });
});

// Other pages (temporary placeholders so links work)
router.get('/categories', (req, res) => {
  res.render('admin/categories');
});

router.get('/announcements', (req, res) => {
  res.render('admin/announcements');
});

router.get('/content', (req, res) => {
  res.render('admin/managecontent');
});

router.get('/messages', (req, res) => {
  res.render('admin/messagemoderation');
});

router.get('/suspicious', (req, res) => {
  res.render('admin/suspicious');
});

router.get('/tickets', (req, res) => {
  const tickets = db.prepare(`SELECT * FROM reports`).all();

  res.render('admin/tickets', {
    tickets
  });
});

router.get('/admin/tickets', requireLogin, (req, res) => {

    const tickets = db.prepare(`
    SELECT
        r.id,
        r.listingId,
        r.reason,
        r.details,
        r.status,
        r.createdAt,
        r.reportedBy,

        u.firstName,
        u.lastName,
        u.email,

        l.title AS listingTitle

    FROM reports r
    LEFT JOIN users u ON r.reportedBy = u.id
    LEFT JOIN listings l ON r.listingId = l.id
    ORDER BY r.createdAt DESC
    `).all();
    
  res.render('tickets', { tickets });
});

module.exports = router;