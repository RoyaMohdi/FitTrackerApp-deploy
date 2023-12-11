var express = require("express");
var router = express.Router();
let Activity = require("../models/activity");
const { body, validationResult } = require("express-validator");
const { google } = require('googleapis');
const youtube = google.youtube({version: 'v3'});


const API_KEY = 'AIzaSyA5H_zeUvStPWOzHhySlYQjfn-gJp4fMrk'; 
const types = ["Swimming", "Running", "Cycling", "Hiking", "Strength Training"];


function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

function formatDateToYYYYMMDD(dateString) {
  const date = new Date(dateString);
  let month = '' + (date.getUTCMonth() + 1),
      day = '' + date.getUTCDate(),
      year = date.getUTCFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}


router.get("/home", function (req, res) {
  Activity.find({ user: req.user._id }).sort({ date: 1 })
    .then((activities) => {
      const formattedActivities = activities.map(activity => {
        return {
          ...activity.toObject(), 
          date: formatDateToYYYYMMDD(activity.date) 
        };
      });
      res.render("activities", { title: "Activities", activities: formattedActivities, types: types });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});


router.use(isAuthenticated); // Apply the isAuthenticated middleware to all routes below

router
  .route("/add")
  .get(function (req, res) {
    res.render("add_activity", {
      title: "Add Activity",
      types: types,
    });
  })
  .post(
    body("activityType", "Type is required").notEmpty(),
    body("duration", "Duration is required").notEmpty(),
    body("date", "Date is required").notEmpty(),
    function (req, res) {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        let activity = new Activity();
        activity.user = req.user._id;
        activity.type = req.body.activityType;
        activity.duration = req.body.duration;
        activity.date = formatDateToYYYYMMDD(req.body.date);
        activity.calorieLoss = req.body.calorieLoss;
        activity
          .save()
          .then(() => {
            console.log(activity);
            res.redirect("/activities/home");
          })
          .catch((error) => {
            console.log(error);
            return;
          });
      } else {
        res.render("add_activity", {
          errors: errors.array(),
          title: "Add Activity",
          types: types,
        });
      }
    }
  );

router
  .route("/edit/:id")
  .get(function (req, res) {
    var id = req.params.id;
    Activity.findById(id).then((foundActivity) => {
      if (foundActivity.user.equals(req.user._id)){
      res.render("edit_activity", {
        activity: foundActivity,
        types: types,
      });
    }else{
      res.redirect("/activities/home");
    }
    });
  })
  .post((req, res) => {
    let updatedActivity = {
      type: req.body.activityType,
      duration: req.body.duration,
      date: formatDateToYYYYMMDD(req.body.date),
      calorieLoss: req.body.calorieLoss,
    };
    Activity.updateOne({ _id: req.params.id }, updatedActivity)
      .then(() => {
        res.redirect("/activities/home");
      })
      .catch((err) => {
        console.log(err);
        return;
      });
  });

router.route("/delete/:id").get(function (req, res) {
  var id = req.params.id;
  Activity.deleteOne({ _id: id }).then(() => {
    res.redirect("/activities/home");
  });
});

router.get("/:activityType", async (req, res) => {
  const activityType = req.params.activityType.toLowerCase();
  try {
    const response = await youtube.search.list({
      q: activityType,
      part: 'snippet',
      type: 'video',
      maxResults: 12,
      key: API_KEY
    });
    const videos = response.data.items.map(item => {
      return {
        title: item.snippet.title,
        url: `https://www.youtube.com/embed/${item.id.videoId}`
      };
    });
    res.render("activity_videos", { activity: activityType, videos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    res.status(500).render("error", { message: "Error fetching videos from YouTube" });
  }
});


module.exports = router;
