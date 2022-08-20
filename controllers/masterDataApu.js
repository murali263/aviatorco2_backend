const database = require("../connection/dbConnection");
const {
  APU_UNITS,
  DB_NAME,
  APU_SEQ_ID,
} = require("../constants/database");
const { getEpochTime, getNextSequence } = require("../lib/utils");

exports.masterDataApu = async (req, res) => {
  let params = req.body;
  let client = await database.getClient();

  if (!req.body.apuReferenceId) {
    req.body["apuReferenceId"] = await getNextSequence(
      client,
      APU_SEQ_ID
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
        .collection(APU_UNITS)
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
        .collection(APU_UNITS)
        .findOneAndUpdate(
          { apuReferenceId: params.apuReferenceId },
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
