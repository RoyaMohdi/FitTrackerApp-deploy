var express = require("express");
var router = express.Router();
const moment = require("moment");
let Activity = require("../models/activity");

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

router.get("/", function (req, res) {
  Activity.find({ user: req.user._id }).sort({ date: 1 })
    .then((activities) => {
      const formattedActivities = activities.map(activity => ({
        ...activity.toObject(),
        date: moment.utc(activity.date).format('YYYY-MM-DD') 
      }));
      res.render("calendar", { title: "Calendar", activities: formattedActivities });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

router.use(isAuthenticated);

module.exports = router;
