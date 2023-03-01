const aws = require("aws-sdk");
const db = new aws.DynamoDB();

/**
 * Función para cobtener las subs de tipo bundle de un usuario
 * @param uuidARC
 * @returns {Promise<any>}
 */
const getSubsBundleByArcUid = (uuidARC, company) => {
  return new Promise((resolve, reject) => {
    const ExpressionAttributeValues = {
      ":uuidARC": { S: uuidARC.toString() },
      ":company": { S: company },
    };
    const params = {
      TableName: "arcsubscriptions-bundleCodes",
      FilterExpression: "uuidARC = :uuidARC AND company = :company",
      ExpressionAttributeValues,
    };
    db.scan(params, (err, data) => {
      if (err) {
        reject(err);
      }
      if (data && data.Items) {
        resolve(data.Items);
      }
    });
  });
};

/**
    * Función para devolver una respuesta formateada
    * @param statusCode
    * @param body
    * @param message
    * @returns {Promise<any>}
 */
const response = (statusCode, body, message) => {
  return new Promise((resolve) => {
    const resp = { statusCode };
    if (body) resp.body = body;
    if (message) resp.message = message; 
    resolve(resp);    
  })
}

exports.handler = async (event) => {
  try {
    const { arcuuid, email, name, company } = event.body;
    const subsBundleCodes = await getSubsBundleByArcUid(arcuuid, company);
    const cleanCodes = [];
    const usedCodes = subsBundleCodes
      .filter((elem) => {
        if (elem.used.S === "N") cleanCodes.push(elem.id.N);
        return elem.used.S === "Y";
      })
      .map((elem) => elem.id.N);
    return subsBundleCodes
        ? await response(200, { email, name, arcuuid, cleanCodes, usedCodes }, 'Bundle codes asociados')
        : await response(400, null, 'El usuario no tiene codigos bundles asociados');
  } catch (error) {
    console.error(
      `::handler | Error al obtener las promociones bundle del usuario - err: ${error.message}`
    );
    return response(400, null, "Error al obtener las promociones bundle");
  }
};
