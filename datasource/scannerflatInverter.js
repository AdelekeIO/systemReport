// const deviceIds = require("./deviceIds");
let deviceIds = ["416990"];
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");
let summary = [];
let counter = 0;
let soy = moment()
  .startOf("year")
  .format();
let diff = moment().diff(moment(soy), "days");

dates = [];
for (let index = 0; index < diff; index++) {
  let newDate = moment(soy)
    .add(index, "days")
    .format();
  let end = moment(newDate)
    .endOf("day")
    .format();
  dates.push({
    start: newDate,
    end
  });
}
console.log(dates.length);

// return;
action({ deviceIds, counter }, async result => {
  summary.push(result);
  console.log(summary.length);

  if (summary.length > 58) {
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
          let data_resp = res.data.Items;
          var InverterData = data_resp.map(res => {
            return {
              InverterData: res.payload.InverterData,
              Timestamp: res.payload.Timestamp
            };
          });

          let { LastEvaluatedKey } = res.data;
          if (!LastEvaluatedKey) {
            cb(InverterData);
            sleep(200);
          } else {
            console.log("In Last Eval Key");
            params["ExclusiveStartKey"] = LastEvaluatedKey;
            params["FilterExpression"] = params["KeyConditionExpression"];
            axios
              .post(url + "/scan", params)
              .then(res => {
                let data_resp = res.data.Items;
                var InverterData2 = data_resp.map(res => {
                  return {
                    InverterData: res.payload.InverterData,
                    Timestamp: res.payload.Timestamp
                  };
                });

                cb(InverterData2);
                sleep(200);
              })
              .catch(err => {
                console.log(`======${id}====${date}in eval====`);
                console.log(err);
              });
          }
        })
        .catch(err => {
          console.log(`======${id}==${date}======`);
          console.log(err);
        });
    });
  });
}
