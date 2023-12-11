var express = require("express");
var router = express.Router();
let Profile = require("../models/profile");
const { body, validationResult } = require("express-validator");
const user = require("../models/user");

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

router.get("/", function (req, res) {
  Profile.findOne({ user: req.user._id })
    .then((existingProfile) => {
      console.log(existingProfile);
      res.render("profile", { title: "Profile", profile: existingProfile });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});

router.use(isAuthenticated);

router
  .route("/update")
  .get(function (req, res) {
    Profile.findOne({ user: req.user._id })
      .then((existingProfile) => {
        res.render("edit_profile", {
          title: "Update Profile",
          profile: existingProfile,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Internal Server Error");
      });
  })
  .post(function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      Profile.findOne({ user: req.user._id })
        .then((existingProfile) => {
          if (existingProfile) {
            return Profile.updateOne(
              { _id: existingProfile._id },
              {
                age: req.body.age,
                birth: req.body.birth,
                weight: req.body.weight,
                height: req.body.height,
                goals: req.body.goals,
              }
            );
          } else {
            let profile = new Profile();
            profile.user = req.user._id;
            profile.age = req.body.age;
            profile.birth = req.body.birth;
            profile.weight = req.body.weight;
            profile.height = req.body.height;
            profile.goals = req.body.goals;
            return profile.save();
          }
        })
        .then(() => {
          res.redirect("/profile");
        })
        .catch((error) => {
          console.log(error);
          return;
        });
    } else {
      res.render("profile", {
        errors: errors,
        title: "Update Profile",
        profile: req.body,
      });
    }
  });

module.exports = router;
