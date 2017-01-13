var express = require('express');
var router = express.Router();
var cons = require('consolidate');
var fs = require('fs');

var server = process.env.SERVER;

const jwt = require('jsonwebtoken');
let tokenSecret = 'varyverysecrettokenithinkso';

var secret = "Celestial Inquisition";

var User = require('../models/user');

var levels = require('../config/answers');

var isAuthenticated = function(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/');
  }
}

function signinSSO(req, res, next) {
    if (req.query.token) {
        jwt.verify(req.query.token, tokenSecret, (err, decoded)=>{
            if (!err) {
                var user = decoded.user;
                req.session.regenerate(function () {
                    req.userd = user;
                    req.session.userId = user._id;
                    // if the user has a password set, store a persistence cookie to resume sessions
                    // if (keystone.get('cookie signin') && user.password) {
                    //     var userToken = user._id + ':' + hash(user.password);
                    //     var cookieOpts = _.defaults({}, keystone.get('cookie signin options'), {
                    //         signed: true,
                    //         httpOnly: true,
                    //         maxAge: 10 * 24 * 60 * 60,
                    //     });
                    //     res.cookie('keystone.uid', userToken, cookieOpts);
                    //     console.log(userToken);
                    // }
                    return next();
                });
            }
            else next();
        });
    }
    else next();
}

router.use(function(req, res, next){
  if (req.session.userId) {
    User.findById(req.session.userId).then(function(usr){
      req.user = usr;
      next();
    }).catch(err=>next())
  } else next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {server: server});
});

router.get('/user', function(req, res){
  if (req.user) res.send(req.user)
  else res.send(false);
})

router.get('/token', signinSSO, function(req, res){
  if (!req.user) {
    new User(req.userd).save(function(err){
      res.redirect('/profile');
    })
  }
  else res.redirect('/profile');
})

// router.get('/test0', function(req, res){
//   console.log(req.user)
//   console.log(req.session.userId)
//   res.send('hi');
// })

router.get('/signout', function(req, res){
  req.session.destroy(function(){
    res.redirect('https://id.nvision.org.in/signout?url='+server+'/');
  });
});

router.get('/leaderboard', function(req, res, next) {
  User.find({}).sort([['level', -1], ['updatedAt', 1]]).exec(function(err, users) {
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

// router.get('/login', function(req, res, next) {
//   if (req.user) {
//     res.redirect('/profile');
//   } else {
//     res.render('login');
//   }
// });

router.get('/profile', isAuthenticated, function(req, res, next) {
  res.render('profile', {uname: req.user.uname, wronguname: req.session.wronguname})
});

// router.get('/verify/:token', function(req, res, next) {
//   jwt.verify(req.params.token, secret, function(err, decoded) {
//     if (decoded) {
//       User.update(decoded, {
//         verified: true
//       }, function(err, user, n) {
//         console.log(err, user, n)
//       })
//       res.redirect("/profile");
//     } else {
//       res.redirect("/");
//     }
//   });
// });

router.post('/uname', isAuthenticated, function(req, res, next) {
  if (!req.body.uname) {
    req.session.wronguname = true
    res.redirect('/profile')
  } else {
    User.findOne({uname: req.body.uname}, function(err, user) {
      if (user) {
        req.session.wronguname = true
        res.redirect('/profile')
      } else {
        User.findOne({email: req.user.email}, function(err, user) {
          user.uname = req.body.uname;
          user.save(function(err) {
            req.session.wronguname = false;
            res.redirect('/profile')
          })
        })
      }
    })
  }
});

// router.get('/q:q', function(req, res){
//   res.render('lvls/l'+req.params.q+'.hbs', {layout: 'play'});
// })

router.get('/play', isAuthenticated, function(req, res, next) {
  if (!req.user.uname) {
    req.session.wronguname = true
    res.redirect('/profile')
  } else {
    User.findById(req.user.id, function(err, user) {
      var l = user.level;
      if (l > 30) {
        return res.render('levels/victory');
      }
      res.render('lvls/l' +l+'.hbs', {level: levels[l], layout: 'play'})
    });
  }
});

router.post('/ans', isAuthenticated, function(req, res, next) {
  if (!req.user.uname) {
    req.session.wronguname = true
    return res.json({url: '/prfile'});
    // res.redirect('/profile')
  } else {
    User.findById(req.user.id, function(err, user) {
      var l = user.level;
      if (req.body && req.body.answer && (levels[l].replace(' ', '') == req.body.answer.toLowerCase().replace(' ', ''))) {
        user.level = l+1;
        user.save(function() {
          res.json({correct: true})
          // res.render('levels/success');
        })
      } else {
        if (req.body && req.body.answer) {
          fs.appendFile('answers/level'+user.level+'.txt', req.body.answer+'\n', function(err){})
        }
        res.json({correct: false});
        // res.render('levels/failure');
      }
    })
  }
});

router.get('/test', function(req, res, next) {
  res.render('levels/victory');
});

module.exports = router;