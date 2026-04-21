var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
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

module.exports = router;
