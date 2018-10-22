const utils = require('../utils');
let request = require('request');
let cheerio = require('cheerio');
let URL = require('url-parse');

let searchQueue = [];
let nodesVisited = [];
let numberOfPages = 0;

const crawl = async (options) => {
  console.log(options);
  const startingURL = options.url;
  const searchType = options.type;
  const maxDepth = options.limit;
  const searchKeyword = options.keyword;
  // debug purposes - can be commented out after fully tested
  console.log(`The starting ULR is ${startingURL}`);
  console.log(`The search type is ${searchType}`);
  console.log(`The maximum depth is ${maxDepth}`);
  console.log(`The search keyword is ${searchKeyword}`);

  if (numberOfPages === 0) {
    searchQueue.push(startingURL);
  }
  // pop the URL from the front of the stack using shift
  var current = searchQueue.shift();
  console.log("**********Current URL**********");
  console.log(current);
  // push the current node to the nodes visited list
  nodesVisited.push(current);
  numberOfPages++;

// Lets now go visit the url
request(current, (error, response, body) => {
    console.log('errors: ', error);
    console.log('status code: ', response && response.statusCode);
    $ = cheerio.load(body);
    let links = $('a');
    let title = $('title');
    console.log("**********Found Link**********");
    $(links).each((i, link) => {
      const foundLink = $(link).attr('href');
      console.log(foundLink);
      searchQueue.push(foundLink);
    });
    if (numberOfPages >= maxDepth) {
      console.log("We've reached the Max Depth");
      return { nodes: [{ id: 1 }, { id: 2 }] };
    }
    // crawl(options);
    return { nodes: [{ id: 1 }, { id: 2 }] };
  });

  /*
  for (let i = 0; i < 10; i += 1) {
    if (options.logPid) {
      console.log(`crawler: pid: ${process.pid}, i: ${i}`);
    }
    if (options.testError) {
      throw new Error('test errorz'); // test throwing an error
    }
    if (options.delay) {
      await utils.delay(options.delay || 1000); // eslint-disable-line
    }
  }
  */
};

process.on('message', async (options) => {
  console.log("in the process");
  try {
    const result = await crawl(options);
    console.log("finished crawl");
    process.send(result);
    console.log("sent results");
  } catch (err) {
    // parent process expects an 'error' property on response if error
    process.send({ error: err.message || 'Something Broke!' });
  }
});
