// const deviceIds = require("./deviceIds");
let deviceIds = ["43450001"];
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");
let summary = [];
let counter = 0;
let soy = moment()
  .startOf("year")
  .format();
// let soy = moment().subtract(1, "day");
let diff = moment().diff(moment(soy), "days");

dates = [];
for (let index = 0; index < diff + 1; index++) {
  let newDate = moment(soy)
    .add(index, "days")
    .format("YYYY-MM-DD");
  dates.push(newDate);
}
console.log({ dates });
// return;
action({ deviceIds, counter }, async result => {
  summary.push(result);
  console.log(summary.length);

  if (summary.length >= 1) {
    fs.writeFile(
      "./power_report__" + deviceIds[0] + ".txt",
      JSON.stringify(summary) + ",",
      function(err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }
    );
  }
});
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function action({ deviceIds }, cb) {
  let report = [];
  const url =
    "https://e6wa7gkf0i.execute-api.us-west-2.amazonaws.com/dev/devicedata";
  deviceIds.map(id => {
    console.log({ id });

    dates.map(date => {
      let params = {
        TableName: "PowerData",

        KeyConditionExpression:
          "DeviceID = :key and  begins_with(DeviceTimeStamp, :up)",
        ExpressionAttributeValues: {
          ":key": `${id}`,
          ":up": `${date}`
        },
        ScanIndexForward: false
      };
      // let params = {
      //   TableName: "Parameters",
      //   KeyConditionExpression:
      //     "DeviceID = :key and  begins_with(DeviceTimeStamp, :up)",
      //   ExpressionAttributeValues: {
      //     ":key": `${id}`,
      //     ":up": `${date}`
      //   },
      //   ScanIndexForward: true
      // };
      axios
        .post(url, params)
        .then(res => {
          let data_resp = res.data.Items;
          // var InverterData = data_resp.map(res => {
          //   return {
          //     InverterData: res.payload.InverterData,
          //     Timestamp: res.payload.Timestamp
          //   };
          // });

          let { LastEvaluatedKey } = res.data;
          if (!LastEvaluatedKey) {
            cb(data_resp);
            sleep(100);
          } else {
            console.log("In Last Eval Key");
            params["ExclusiveStartKey"] = LastEvaluatedKey;
            params["FilterExpression"] = params["KeyConditionExpression"];
            axios
              .post(url + "/scan", params)
              .then(res => {
                let data_resp = res.data.Items;
                // var InverterData2 = data_resp.map(res => {
                //   return {
                //     InverterData: res.payload.InverterData,
                //     Timestamp: res.payload.Timestamp
                //   };
                // });

                cb(data_resp);
                sleep(100);
              })
              .catch(err => {
                console.log(`==ERROR=A===${id}====${date}in eval====`);
                // console.log(err);
              });
          }
        })
        .catch(err => {
          console.log(`==ERROR=B===${id}==${date}======`);
          // console.log(err);
        });
    });
  });
}
