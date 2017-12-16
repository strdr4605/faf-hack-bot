var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  console.log("Request", req.body);
  // console.log("To Send", {
  //   speech: "Hello text",
  //   displayText: "123",
  //   data: {},
  //   contextOut: [],
  //   source: req.body.result.source
  // });
  var origin;
  if ( req.body.originalRequest) {
    origin = req.body.originalRequest.source;
  } else {
    origin =  req.body.result.source
  }
  var speech;
  if (req.body.result.fulfillment.speech.length > 0) {
    speech = "Hello, " + req.body.result.fulfillment.speech;
  } else {
    speech = "OMG What is this!!!";
  }
  res.send({
    speech: speech,
    displayText: "123",
    data: {},
    contextOut: [],
    source: origin
  });
});

module.exports = router;
