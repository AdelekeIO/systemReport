// const deviceIds = require("./deviceIds");
let deviceIds = ["416990"];
const axios = require("axios");
const moment = require("moment");
const ObjectsToCsv = require("objects-to-csv");
const fs = require("fs");
const flatten = require("flat");
let summary = [];
let counter = 0;
let soy = moment()
  .startOf("year")
  .format("YYYY-MM-DD");
let diff = moment().diff(moment(soy), "days");
console.log(soy);
console.log(moment().diff(moment(soy), "days"));

dates = [];
for (let index = 0; index < diff; index++) {
  let newDate = moment(soy)
    .add(index, "days")
    .format("YYYY-MM-DD");
  dates.push(newDate);
}
// console.log(dates);
// return;
action({ deviceIds, counter }, async result => {
  summary.push(result);

  await new ObjectsToCsv(summary)
    .toDisk("./report_" + deviceIds[0] + ".csv")
    .then(() => {
      console.log(summary.length);
      fs.writeFile(
        "./report__" + deviceIds[0] + ".txt",
        JSON.stringify(summary) + ",",
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        }
      );
      sleep(300);
    });
});
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function action({ deviceIds }, cb) {
  let report = [];
  const url =
    "https://e6wa7gkf0i.execute-api.us-west-2.amazonaws.com/dev/devicedata";
  deviceIds.map(id => {
    dates.map(date => {
      let params = {
        TableName: "Parameters",
        KeyConditionExpression:
          "DeviceID = :key and  begins_with(DeviceTimeStamp, :up)",
        ExpressionAttributeValues: {
          ":key": `${id}`,
          ":up": `${date}`
        },
        ScanIndexForward: true
      };

      axios
        .post(url, params)
        .then(res => {
          let data_resp = res.data;
          let flatted = flatten(data_resp);
          let { LastEvaluatedKey } = res.data;
          if (!LastEvaluatedKey) {
            cb(flatted);
          } else {
            console.log("In Last Eval Key");
            params["ExclusiveStartKey"] = LastEvaluatedKey;
            params["FilterExpression"] = params["KeyConditionExpression"];
            axios
              .post(url + "/scan", params)
              .then(res => {
                let resp = res.data;
                let flatted = flatten(resp);
                cb(flatted);
              })
              .catch(err => {
                console.log(`======${id}====${date}in eval====`);
                // cb({ id, date, Count: "", error: JSON.stringify(err) });
                console.log(err);
              });
          }
        })
        .catch(err => {
          console.log(`======${id}==${date}======`);
          console.log(err);

          // cb({ id, date, Count: "", error: JSON.stringify(err) });
        });
    });
  });
}
