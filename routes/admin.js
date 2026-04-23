const express = require('express');
const router = express.Router();
const db = require('../db');

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
  res.render('admin/tickets');
});

module.exports = router;