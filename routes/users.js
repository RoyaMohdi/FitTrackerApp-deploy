var express = require('express');
var router = express.Router();
let User = require("../models/user");
var passport = require("passport");
const bcryptjs = require("bcryptjs");
const { body, validationResult } = require("express-validator");


router
  .route("/register")
  .get((req, res, next) => {
    res.render("register");
  })
  .post((req, res, next) => {
    let user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    bcryptjs.genSalt(10).then((salt) =>
      bcryptjs.hash(req.body.password, salt).then((hashedPassword) => {
        user.password = hashedPassword;
        user
          .save()
          .then(() => {
            res.redirect("/users/login")
          })
          .catch((error) => {
            console.log(error);
            return;
          });
      })
    );
  });

  router
  .route("/login")
  .get((req, res, next) => {
    res.render("login");
  })
  .post(passport.authenticate("local", {
    successRedirect: "/activities/home",
    failureRedirect: "/users/login",
    failureMessage: true,
  }));


  router.route("/logout").get((req, res) => {
    req.logout((error) => {
      if (error) {
        return next(error);
      }
      res.redirect("/users/login");
    });
  });
  
  

module.exports = router;
