const database = require("../connection/dbConnection");
const {
FUEL_TYPE,
  DB_NAME,
  FUEL_SEQ_ID,
} = require("../constants/database");
const { getEpochTime, getNextSequence } = require("../lib/utils");

exports.masterFuel = async (req, res) => {
    console.log("master Fuel type is trrigered")
  let params = req.body;
  let client = await database.getClient();

  if (!req.body.fuelTypeReferenceId) {
    req.body["fuelTypeReferenceId"] = await getNextSequence(
      client,
      FUEL_SEQ_ID
    );
    params.createdTimeUnix = getEpochTime();
  }

  params.updatedTimeUnix = getEpochTime();

  let pageSize = !isNaN(parseInt(req.body.pageSize))
    ? parseInt(req.body.pageSize)
    : 5;
  let pageIndex = !isNaN(parseInt(req.body.pageIndex))
    ? parseInt(req.body.pageIndex)
    : 0;

  try {
    if (req.body.action == "viewDetails") {
      const taskLists = await client
        .db(DB_NAME)
        .collection(FUEL_TYPE)
        .aggregate([
          {
            $facet: {
              data: [
                { $project: { _id: 0 } },
                { $sort: { createdTimeUnix: -1 } },
                { $skip: pageIndex * pageSize },
                { $limit: pageSize },
              ],
              pagination: [{ $count: "total" }],
            },
          },
        ])
        .toArray();

      res.status(200).json({
        status: 200,
        body: {
          success: true,
          responseData: taskLists[0].data,
          total: taskLists[0].pagination[0].total,
        },
      })
    } else {
      const result = await client
        .db(DB_NAME)
        .collection(FUEL_TYPE)
        .findOneAndUpdate(
          { fuelTypeReferenceId: params.fuelTypeReferenceId },
          { $set: params },
          { returnNewDocument: true, upsert: true, returnOriginal: false }
        );
      res.send({
        status: 200,
        body: {
          success: true,
          responseData: result,
        },
      });
    }
  } catch (err) {
    throw new Error(err.toString());
  }
};
