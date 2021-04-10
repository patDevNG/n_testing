const express = require("express");
const axios = require("axios");

const server = express();

server.get("/", async (req, res) => {
  res.status(200).send("Welcome to test server");
});

/**
 * - I am assuming that the ad.txt will be consist with the first line containing
 * the publisher_id something like "#Ads.txt for bjpenn.com",
 * so that I can do a form of validation of the publisher_passed into the route
 *
 * - I also used regex in my analysing of the ad.txt
 * @ params req.params publisher_id: Publisher's id;
 * return response status, data, message
 */
server.get("/publisher/:publisher_id", async (req, res) => {
  // retrieve the publisher_id from request params;
  let { publisher_id } = req.params;
  publisher_id = publisher_id.toLowerCase();

  //make axios call to retrieve the ads.txt
  const url = "https://bjpenn.com/ads.txt ";
  try {
    const result = await axios({
      url,
      method: "GET",
    });
    const { data } = result;
    let lines = data.split("\n");
    let newArr = [];
    let firstLine;
    for (let line = 0; line < lines.length; line++) {
      if (line == 0) {
        firstLine = lines[0];
      }

      const res = lines[line].match(/(^|\W)(#[a-z\d][\w-]*)/gi);

      if (res && res.constructor === Array) {
        const formatted = res.map((el) => {
          return el.trim().substring(1);
        });
        newArr.push(...formatted);
      }
    }
    // removes duplicate
    const newArrSet = new Set(newArr);

    const splittedFirstLine = firstLine.split(" ");

    const retrievedPublisherId = splittedFirstLine[2].split(".")[0];
    // check for the correct publisher_id
    if (retrievedPublisherId === publisher_id) {
      const setArr = [...newArrSet].splice(3);

      const publisherId = publisher_id.charAt(0).toUpperCase() + publisher_id.slice(1);

      const result = {
        [`${publisherId}`]: setArr,
      };
      return res.status(200).json({
        status: "SUCCESS",
        message: "Successful",
        data: result,
      });
    }
    return res.status(400).json({
      status: "ERROR",
      message: "Invalid Publisher Id",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
      data: null,
    });
  }
});

server.listen(process.env.PORT || 8584, () => {
  console.log(`Server started at port :8584`);
});
