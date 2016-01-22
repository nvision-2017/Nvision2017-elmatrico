var express = require('express');
var router = express.Router();
var cons = require('consolidate');
var jwt = require('jsonwebtoken');

var secret = "Celestial Inquisition";

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('AWqXfiPp1NT6p8_gcTF4mw');

var User = require('../models/user');

var levels = require('../config/levels');

var isAuthenticated = function(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/login');
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/leaderboard', function(req, res, next) {
  User.find({}).sort([['level', -1], ['UpdatedAt', -1]]).exec(function(err, users) {
    res.render('leaderboard', {users: users});
  })
});

router.get('/ripsteve', function(req, res, next) {
  User.find({}).exec(function(err, users) {
    res.render('contact', {users: users});
  })
});

router.get('/verified', function(req, res, next) {
  res.render('verified');
});

router.get('/login', function(req, res, next) {
  if (req.user) {
    res.redirect('/profile');
  } else {
    res.render('login');
  }
});

router.get('/profile', isAuthenticated, function(req, res, next) {
  res.render('profile', {uname: req.user.uname})
});

router.get('/verify/:token', function(req, res, next) {
  jwt.verify(req.params.token, secret, function(err, decoded) {
    if (decoded) {
      User.update(decoded, {
        verified: true
      }, function(err, user, n) {
        console.log(err, user, n)
      })
      res.redirect("/profile");
    } else {
      res.redirect("/");
    }
  });
});

router.post('/uname', isAuthenticated, function(req, res, next) {
  console.log(req.body)
  if (!req.body.uname) {
    req.session.wronguname = true
    res.redirect('/profile')
  } else {
    User.findOne({uname: req.body.uname}, function(err, user) {
      if (user) {
        req.session.wronguname = true
        res.redirect('/profile')
      } else {
        User.findOne({emailId: req.user.emailId}, function(err, user) {
          user.uname = req.body.uname;
          user.save(function(err) {
            res.redirect('/profile')
          })
        })
      }
    })
  }
});

router.get('/play', isAuthenticated, function(req, res, next) {
  if (!req.user.uname) {
    req.session.wronguname = true
    res.redirect('/profile')
  } else {
    User.findById(req.user.id, function(err, user) {
      var l = user.level;
      console.log(levels[l])
      res.render('levels/' + levels[l].file, {level: levels[l]})
    });
  }
});

router.post('/ans', isAuthenticated, function(req, res, next) {
  if (!req.user.uname) {
    req.session.wronguname = true
    res.redirect('/profile')
  } else {
    User.findById(req.user.id, function(err, user) {
      var l = user.level;
      console.log(req.body, levels[l])
      if (levels[l].answer == req.body.answer.toLowerCase()) {
        user.level = l+1;
        user.save(function() {
          res.render('levels/success');
        })
      } else {
        res.render('levels/failure');
      }
    })
  }
});

router.get('/test', function(req, res, next) {
  res.render('levels/audio');
});

var sendConfirmation = function(user) {
  var token = jwt.sign(user, secret);
  cons.handlebars('views/mail.htm', {
    link: "http://eldorado.nvision.org.in/verify/" + token
  }, function(err, html) {
    var message = {
      "html": html,
      "subject": "Confirm Email: El Dorado!",
      "from_email": "no_reply@nvision.org.in",
      "from_name": "Nvision, IITH",
      "to": [{
        "email": user.emailId,
        "type": "to"
      }],
      "headers": {
        "Reply-To": "nvision@iith.ac.in"
      },
      "important": false,
      "track_opens": null,
      "track_clicks": null,
      "auto_text": null,
      "auto_html": null,
      "inline_css": null,
      "url_strip_qs": null,
      "preserve_recipients": null,
      "view_content_link": null,
      "tracking_domain": null,
      "signing_domain": null,
      "return_path_domain": null,
      "merge": false,
      "tags": [],
      "subaccount": "gouthamve"
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({
      "message": message,
      "async": async
    }, function(result) {
      console.log(result);
    }, function(e) {
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    });
  });
}


module.exports = router;