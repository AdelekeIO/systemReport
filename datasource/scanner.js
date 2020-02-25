const deviceIds = require("./deviceIds");
// let deviceIds = ["417790"];
const axios = require("axios");
const moment = require("moment");
const ObjectsToCsv = require("objects-to-csv");
let summary = [];
let counter = 0;
let sow = moment()
  .subtract(1, "weeks")
  .startOf("week")
  .subtract(1, "days")
  .format("YYYY-MM-DD");
dates = [];
for (let index = 0; index < 12; index++) {
  let newDate = moment(sow)
    .add(index, "days")
    .format("YYYY-MM-DD");
  dates.push(newDate);
}
action({ deviceIds, counter }, async result => {
  summary.push(result);
  console.log(summary.length);
  await new ObjectsToCsv(summary).toDisk("./report.csv").then(() => {
    if (summary.length === dates.length) {
      console.log(++counter + " --- done");
    }
  });
});

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
          let { Count, LastEvaluatedKey } = res.data;
          if (!LastEvaluatedKey) {
            cb({ id, date, Count, error: "" });
          } else {
            console.log("In Last Eval Key");
            let fc = parseInt(Count);
            params["ExclusiveStartKey"] = LastEvaluatedKey;
            params["FilterExpression"] = params["KeyConditionExpression"];
            axios
              .post(url + "/scan", params)
              .then(res => {
                let { Count } = res.data;
                let total = fc + parseInt(Count);
                cb({ id, date, Count: total, error: "" });
              })
              .catch(err => {
                console.log(`======${id}====${date}in eval====`);
                cb({ id, date, Count: "", error: JSON.stringify(err) });
                console.log(err);
              });
          }
        })
        .catch(err => {
          console.log(`======${id}==${date}======`);
          cb({ id, date, Count: "", error: JSON.stringify(err) });
        });
    });
  });
}
