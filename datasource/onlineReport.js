const { RESTDataSource } = require("apollo-datasource-rest");
class OnlineReport extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://e6wa7gkf0i.execute-api.us-west-2.amazonaws.com/";
    this.i = 0;
  }

  async getFrequencyById({ CID }) {
    console.log(CID);

    let params = {
      TableName: "Parameters",

      KeyConditionExpression:
        "DeviceID = :key and  begins_with(DeviceTimeStamp, :up)",
      ExpressionAttributeValues: {
        ":key": `${CID}`,
        ":up": "2020-02-20"
      },
      ScanIndexForward: true
    };
    // const response = await this.post(`dev/devicedata`, params);
    // if (response) {
    //   let { LastEvaluatedKey, Count } = response;
    //   let payload = [];

    //   payload.push({ CID, Count, LastEvaluatedKey });
    //   if (LastEvaluatedKey == undefined) {
    //     return Array.isArray(payload)
    //       ? payload.map(p => this.frequencyReducer(p))
    //       : ["none"];
    //   }
    // }
  }

  frequencyReducer(p) {
    console.log(p);

    return {
      CID: p.CID || 0,
      Count: p.Count || 0,
      LastEvaluatedKey: p.LastEvaluatedKey || {}
    };
  }
}

module.exports = OnlineReport;

// fetchUsers();
