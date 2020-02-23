const deviceIds = require("./deviceIds");
const axios = require("axios");
const moment = require("moment");
const { convertArrayToCSV } = require("convert-array-to-csv");
const ObjectsToCsv = require("objects-to-csv");
const converter = require("convert-array-to-csv");
let summary = [];
let counter = 0;
let sow = moment()
  .subtract(1, "weeks")
  .startOf("week")
  .subtract(1, "days")
  .format("YYYY-MM-DD");
dates = [];
for (let index = 0; index < 9; index++) {
  let newDate = moment(sow)
    .add(index, "days")
    .format("YYYY-MM-DD");
  dates.push(newDate);
}
action({ deviceIds, counter }, result => {
  summary.push(result);
  console.log(summary.length);

  new ObjectsToCsv(summary).toDisk("./report.csv");
  // const csvFromArrayOfArrays = convertArrayToCSV(summary);
});

async function action({ deviceIds, counter }, cb) {
  let report = [];
  const url =
    "https://e6wa7gkf0i.execute-api.us-west-2.amazonaws.com/dev/devicedata";

  deviceIds.map(id => {
    // if (counter === 11) {
    //   return report;
    // }
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
            // let tempQuery = ;
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

          // console.log({ id, date, Count, LastEvaluatedKey });
        })
        .catch(err => {
          console.log(`======${id}==${date}======`);
          cb({ id, date, Count: "", error: JSON.stringify(err) });
        });
    });

    counter++;
  });
  // cb(report);
}
