// this is the IS Department skill

'use strict';
const Alexa = require("alexa-sdk");
const AWS = require("aws-sdk");
const data = require("./data.json");

AWS.config.update({region: 'us-east-1'});

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.registerHandlers(handlers);
  alexa.execute();
};

// helper functions
// probably want something to translate professor full names to their Alexa counterpart

// handlers
const handlers = {
  'LaunchRequest': function () {
    const speechOutput = 'This is the IS Department Skill';
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  },
  
  //Required Intents
  'AMAZON.HelpIntent': function () {
    const speechOutput = 'This is the IS Department Skill';
    this.emit(':tell', speechOutput);
  },
  
  'AMAZON.CancelIntent': function () {
    const speechOutput = 'Goodbye!';
    this.emit(':tell', speechOutput);
  },
  
  'AMAZON.StopIntent': function () {
    const speechOutput = 'See you later!';
    this.emit(':tell', speechOutput);
  },
  
  'Unhandled': function () {
    let speechOutput = 'I did not understand that command.';
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  },
  
  'SessionEndedRequest': function () {
    this.emit(':saveState', true);
  },
  
  //Custom Intents
  'Office': function () {
    let speechOutput;
    if (this.event.request.dialogState !== "COMPLETED") {
      this.emit(':delegate');
    } else if (!data[this.event.request.intent.slots.professor.value]) {
      speechOutput = "We couldn't find that professor on file. Could you try again?";
      this.emit(':responseReady');
    } else {
      let professor = this.event.request.intent.slots.professor.value;
      let office = data[professor].office;
      speechOutput = "Professor " + professor + " is in " + office;
      this.reponse.speak(speechOutput);
      this.emit(':responseReady');
    }
  },
  
  'OfficeHours': function () {
    let speechOutput;
    if (this.event.request.dialogState !== "COMPLETED") {
      this.emit(':delegate');
    } else if (!data[this.event.request.intent.slots.professor.value]) {
      speechOutput = "We couldn't find that professor on file. Could you try again?";
      this.emit(':responseReady');
    } else {
      let professor = this.event.request.intent.slots.professor.value;
      //could not exist or be by appointment only, just a start day, or multiple days
      //if it's not just by appointment only then it could be a start time or a range
      let officeHours = data[professor].officeHours;
      if (officeHours) {
        //has days
        if (typeof officeHours === "object") {
          speechOutput = "This professor has office hours on ";
          for (i = 0; i < officeHours.length; i++) {
            if (i > 0) speechOutput += " and ";
            speechOutput += officeHours[i].dayOfWeek;
            if (officeHours[i].endTime) {
              speechOutput += ("from " + officeHours[i].startTime + " to " + officeHours[i].endTime);
            } else {
              speechOutput += ("at " + officeHours[i].startTime);
            }
          }
          this.response.speak(speechOutput);
          this.emit(':responseReady');
        } else {
          //by appointment only
          this.response.speak("This professor is hosting office hours by appointment only.");
          this.emit(':responseReady');
        }
      } else {
        this.response.speak("This professor isn't hosting office hours this semester.");
        this.emit(':responseReady');
      }
    }
  },
  
  'Courses': function () {
    let speechOutput;
    if (this.event.request.dialogState !== "COMPLETED") {
      this.emit(':delegate');
    } else if (!data[this.event.request.intent.slots.professor.value]) {
      speechOutput = "We couldn't find that professor on file. Could you try again?";
      this.emit(':responseReady');
    } else {
      let professor = this.event.request.intent.slots.professor.value;
      let courses = data[professor].courses;
      if (courses) {
        //is teaching at least one course
        speechOutput = "This professor is teaching ";
        for (i = 0; i < courses.length; i++) {
          if (i > 0) speechOutput += " and ";
          speechOutput += courses[i].title;
        }
        this.response.speak(speechOutput);
        this.emit(':responseReady');
      } else {
        this.response.speak("This professor isn't teaching a course this semester.");
        this.emit(':responseReady');
      }
    }
  }
  
};