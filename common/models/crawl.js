const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const constant = require('./../../server/utility/constant');

module.exports = function (Crawler) {

  Crawler.getLinkData = function (data, cb) {
    async.auto ({
      getParsedHtmlData : function(callback) {
        request({
          url: constant.LINK,
        }, function (err, res, body) {
          if (err) {
            callback(null, { Success: false, msg: "Something went wrong", data: {} });
          } else if(body){
            let $ = cheerio.load(body);
            let jsonData = getJsonData($);
            console.log("json data");
            console.dir(jsonData);
            jsonData =[{
              "Name" :  "prarthana",
              "Tags" : "This is tag",
              "ProgrammingLanguage" : "node.js" 
            }, {
              "Name" :  "dolly",
              "Tags" : "This is tag2",
              "ProgrammingLanguage" : "react.js" 
            }
          ]
            callback(null, jsonData);
          }
        })
      },
      saveInDb : ['getParsedHtmlData', function(callback, result) {
        Crawler.create(result.getParsedHtmlData)
          .then(function (result) {
            if (result) {
              callback(null, result);
            } else {
              callback({Success : false, msg : "There was error in creating entry"});
            }
          })
          .catch(function (error) {
            console.log("errrrrrrr");
            console.log(error)
            callback(null, error);
          })
      }]
    }, function (error, result) {
      if (error) {
        cb(null, error);
      } else {
        cb(null, result);
      }
    })

    function getJsonData($) {
      let arr = [];
      
      $('div._1HmYoV > div.col-10-12>div.bhgxx2>div._3O0U0u').each(function (index) {
        console.log("inside for loop");
        const data = $(this).find('div._1UoZlX>a').attr('href');
        const name = $(this).find('div._1-2Iqu>div.col-7-12>div._3wU53n').text();
        const tags = $(this).find('div._1-2Iqu>div.col-7-12>div._3wU53n').text();
        const PL = $(this).find('div._1-2Iqu>div.col-7-12>div._3wU53n').text();
        const description = $(this).find('div._1-2Iqu>div.col-7-12>div._3wU53n').text();

        const obj = {
          name: name,
          tags: tag,
          ProgrammingLanguage : PL,
          Description : description
        };
        arr.push(JSON.stringify(obj));
        
      });
      return arr;
    }
  }

  Crawler.search = function (data, cb) {
    Crawler.findOne(data)
        .then (function (result) {
          if(result) {
            cb (null, result);
          } else {
            cb (null, {Success :false, msg : "No results found"});
          }
        })
  }
  Crawler.remoteMethod(
    'getLinkData', {
      description: 'get html data from website',
      accepts: {
        arg: 'data',
        type: 'object',
        default: {},
        required: true,
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'result',
        type: 'object',
        root: true,
        description: '{success: true, msg: "message", data: result}'
      },
      http: {
        verb: 'post'
      }
    }
  )

  Crawler.remoteMethod(
    'search', {
      description: 'search tags',
      accepts: {
        arg: 'data',
        type: 'object',
        default: {},
        required: true,
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'result',
        type: 'object',
        root: true,
        description: '{success: true, msg: "message", data: result}'
      },
      http: {
        verb: 'post'
      }
    }
  )
}

