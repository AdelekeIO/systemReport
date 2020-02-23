const { RESTDataSource } = require("apollo-datasource-rest");
class OwnerDB extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api-solarbase.arnergy.com/api/v1/";
  }

  async getAllOwners() {
    const response = await this.get(
      `installations?filter[include]=user&filter[include]=deviceType&filter[include]=locations`
    );

    return Array.isArray(response)
      ? response.map(device => this.ownerReducer(device))
      : [];
  }

  async getOwnerById({ CID }) {
    const response = await this.get(
      `installations?filter[include]=user&filter[include]=deviceType&filter[include]=locations&filter[where][or][0][CID]=${CID}&filter[where][or][1][solarKitIds]=${CID}`
    );

    return Array.isArray(response)
      ? response.map(p => this.ownerReducer(p))
      : ["none"];
  }

  ownerReducer(p) {
    // console.log(p);

    return {
      CID: p.CID || 0,
      name: p.name,
      status: p.status,
      solarKitIds: p.solarKitIds,
      from: p.from,
      to: p.to,
      warranty: p.warranty,
      maintenance: p.maintenance,
      commissioned: p.commissioned,
      approvedAt: p.approvedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      id: p.id,
      approvedById: p.approvedById,
      userId: p.userId,
      deviceTypeId: p.deviceTypeId,
      deviceRequestId: p.deviceRequestId,
      user: p.user,
      email: p.user.email,
      deviceType: p.deviceType,
      locations: p.locations
    };
  }
}

module.exports = OwnerDB;

// fetchUsers();
