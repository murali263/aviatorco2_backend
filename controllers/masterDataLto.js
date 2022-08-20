const database = require("../connection/dbConnection");
const {
  LTO_WITH_TAXI,
  DB_NAME,
  LTO_WITH_TAXI_SEQ_ID,
} = require("../constants/database");
const { getEpochTime, getNextSequence } = require("../lib/utils");

exports.masterDataLto = async (req, res) => {
  let params = req.body;
  let client = await database.getClient();
  let createdTimeUnix = getEpochTime();

  if (!req.body.ltoReferenceId) {
    req.body["ltoReferenceId"] = await getNextSequence(
      client,
      LTO_WITH_TAXI_SEQ_ID
    );
    params.createdTimeUnix = createdTimeUnix;
  }

  let pageSize = !isNaN(parseInt(req.body.pageSize))
    ? parseInt(req.body.pageSize)
    : 5;
  let pageIndex = !isNaN(parseInt(req.body.pageIndex))
    ? parseInt(req.body.pageIndex)
    : 0;

  try {
    if (req.body.action == "viewDetails") {   
      const taskLists =  await client.db(DB_NAME).collection(LTO_WITH_TAXI).aggregate([
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
      ]).toArray();

      res.status(200).json({
        status: 200,
        body: {
          success: true,
          responseData: taskLists[0].data,
          total: taskLists[0].pagination[0].total,
        },
      });
    } else {
      const result = await client
        .db(DB_NAME)
        .collection(LTO_WITH_TAXI)
        .findOneAndUpdate(
          { ltoReferenceId: params.ltoReferenceId },
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
