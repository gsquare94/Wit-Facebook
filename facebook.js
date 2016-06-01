'use strict';

// See the Send API reference
// https://developers.facebook.com/docs/messenger-platform/send-api-reference
const request = require('request');
const Config = require('./const.js');

const fbReq = request.defaults({
  uri: 'https://graph.facebook.com/me/messages',
  method: 'POST',
  json: true,
  qs: {
    access_token: Config.FB_PAGE_TOKEN
  },
  headers: {
    'Content-Type': 'application/json'
  },
});


const fbMessage = (recipientId, msg, cb) => {
  const opts = {
    form: {
      recipient:{
        id:recipientId,
      },
      message:{
        attachment:{
          type:template,
          payload:{
            template_type:generic,
            elements:[
              {
                title:"Classic White T-Shirt",
                image_url:"http://image.tmdb.org/t/p/w92/AoGpqw4S4ZGgwhlM3FgzFVwyIGl.jpg",
                subtitle:"Soft white cotton t-shirt is back in style",
              }
            ]
          }
        }
      }
    }
  };

  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};


// See the Webhook reference
// https://developers.facebook.com/docs/messenger-platform/webhook-reference
const getFirstMessagingEntry = (body) => {
  const val = body.object === 'page' &&
    body.entry &&
    Array.isArray(body.entry) &&
    body.entry.length > 0 &&
    body.entry[0] &&
    body.entry[0].messaging &&
    Array.isArray(body.entry[0].messaging) &&
    body.entry[0].messaging.length > 0 &&
    body.entry[0].messaging[0];

  return val || null;
};


module.exports = {
  getFirstMessagingEntry: getFirstMessagingEntry,
  fbMessage: fbMessage,
  fbReq: fbReq
};
