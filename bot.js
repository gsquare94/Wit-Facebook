'use strict';

// Weather Example
// See https://wit.ai/sungkim/weather/stories and https://wit.ai/docs/quickstart
const Wit = require('node-wit').Wit;
const FB = require('./facebook.js');
const Config = require('./const.js');

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

// Bot actions
const actions = {
  say(sessionId, context, message, cb) {
    console.log(message);

    // Bot testing mode, run cb() and return
    if (require.main === module) {
      cb();
      return;
    }

    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to from context
    // TODO: need to get Facebook user name
    const recipientId = context._fbid_;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      FB.fbMessage(recipientId, message, (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err
          );
        }

        // Let's give the wheel back to our bot
        cb();
      });
    } else {
      console.log('Oops! Couldn\'t find user in context:', context);
      // Giving the wheel back to our bot
      cb();
    }
  },
  merge(sessionId, context, entities, message, cb) {
    // Retrieve the location entity and store it into a context field
    const mov = firstEntityValue(entities, 'local_search_query');
    if (mov) {
      context.mov = mov.split(' ').join('+'); // store it in context
      console.log(context.mov)

    }

    cb(context);
  },

  error(sessionId, context, error) {
    console.log(error.message);
  },

  // fetch-weather bot executes
  ['search-movie'](sessionId, context, cb) {
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)
    //context.forecast = 'sunny';
    var request = require('request');
    request('http://www.omdbapi.com/?t='+context.mov+'&y=&plot=short&r=json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage.
        var response = JSON.parse(body);
        if(response.Response == "False"){
          context.output = "I don't think that's a movie##Couldn't find movie";
        }
        else{
          var output = response.Title+"(IMDB: "+response.imdbRating+")##"+response.Plot;
          if(output.length>320){
            output = output.substring(0,320);
            output = output.substring(0,output.lastIndexOf(".")+1);
          }
          // if ((response.Title).indexOf(context.mov) == -1) {
          //   output = "I couldn't find your movie, but I found this:\n" + output;
          // }
          context.output = output;
        }
        console.log(context.output)
        cb(context);
      }
    })

  },
};


const getWit = () => {
  return new Wit(Config.WIT_TOKEN, actions);
};

exports.getWit = getWit;

// bot testing mode
// http://stackoverflow.com/questions/6398196
if (require.main === module) {
  console.log("Bot testing mode.");
  const client = getWit();
  client.interactive();
}
