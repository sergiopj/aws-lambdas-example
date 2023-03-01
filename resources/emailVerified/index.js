const aws = require("aws-sdk");
const db = new aws.DynamoDB();

/**
    * Función para comprobar que un email tiene un formato valido
    * @param email
    * @returns {Promise<boolean>}
 */
const checkEmailFormat = (email) => {
  return new Promise((resolve, reject) => {
    if (!email) {
      reject(new Error("::checkEmailFormat | Error no ha llegado el email de usuario"));
    }
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    resolve(email.match(mailformat)[0]);
  });
};

/**
    * Función para obtener de la bd un usuario por id
    * @param id
    * @returns {Promise<any>}
 */
const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const ExpressionAttributeValues = {
      ":id": { S: id.toString() }
    };
    const params = {
      TableName: 'User-cv4y6y3kpza5hojds2aryddv3u-int',
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues,
    };
    db.query(params, (err, data) => {
      if (err) {
        reject(err);
      }
      if (data && data.Items[0]) {
        const { email, id, name } = data.Items[0];
        resolve({
          userId: id.S,
          email: email.S,
          name: name.S,
        });
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
    const user = event.body.user ? event.body.user : null;
    const validEmail = await checkEmailFormat(user.email);
    if (validEmail) {
      const result = await getUserById(user.id);
      result.arcuuid = user.arcuuid;
      if (result) {
        const { userId, email, name, arcuuid } = result;     
        return email === user.email && userId === user.id
          ? response(200, { userId, email, name, arcuuid }, 'Email correcto')
          : response(400, null, 'El email no es válido o no corresponde a ningun usuario');
      } else {
        return response(400, null, 'El email no corresponde a ningun usuario');
      }      
    }
  } catch (error) {
    console.error(`::handler | Error al verificar el email usuario - err: ${error.message}`);
    return response(400, null, "Error al verificar el email");    
  }
};
