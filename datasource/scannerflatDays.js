// const deviceIds = require("./deviceIds");
let deviceIds = ["437500"];
const axios = require("axios");
const moment = require("moment");
const ObjectsToCsv = require("objects-to-csv");
const fs = require("fs");
const flatten = require("flat");
let summary = [];
let counter = 0;
let yesterday = moment().subtract(1, "day");
let diff = moment().diff(moment(yesterday), "days");

dates = [];
for (let index = 0; index < diff + 1; index++) {
  let newDate = moment(yesterday)
    .add(index, "days")
    .startOf("day")
    .format();
  let end = moment(newDate)
    .endOf("day")
    .format();
  dates.push({
    start: newDate,
    end
  });
}
// console.log({ dates });

// return;
action({ deviceIds, counter }, async result => {
  summary.push(result);
  console.log(summary.length);

  if (summary.length > 1) {
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
  }

  // await new ObjectsToCsv(summary)
  //   .toDisk("./report_" + deviceIds[0] + ".csv")
  //   .then(() => {
  //     console.log(summary.length);
  //     sleep(300);
  //   });
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
      //   let params = {
      //     TableName: "Parameters",
      //     KeyConditionExpression:
      //       "DeviceID = :key and  begins_with(DeviceTimeStamp, :up)",
      //     ExpressionAttributeValues: {
      //       ":key": `${id}`,
      //       ":up": `${date}`
      //     },
      //     ScanIndexForward: true
      //   };
      let params = {
        TableName: "Parameters",
        KeyConditionExpression:
          "DeviceID = :key and DeviceTimeStamp BETWEEN :up AND :down",
        ExpressionAttributeValues: {
          ":key": `${id}`,
          ":up": `${date.start}`,
          ":down": `${date.end}`
        },
        Limit: 1440,
        ScanIndexForward: true
      };
      axios
        .post(url, params)
        .then(res => {
          // let c = 0;
          let data_resp = res.data.Items;
          // let data_resp = res.data.Items.map(data => {
          //   console.log(`flatted ${++c}`);

          //   return data;
          // });
          let { LastEvaluatedKey } = res.data;
          if (!LastEvaluatedKey) {
            cb(data_resp);
            sleep(200);
          } else {
            console.log("In Last Eval Key");
            params["ExclusiveStartKey"] = LastEvaluatedKey;
            params["FilterExpression"] = params["KeyConditionExpression"];
            axios
              .post(url + "/scan", params)
              .then(res => {
                let data_resp = res.data.Items;

                // let data_resp = res.data.Items.map(data => {
                //   return data;
                // });
                cb(data_resp);
                sleep(200);
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
