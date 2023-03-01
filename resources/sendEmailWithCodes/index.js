const aws = require("aws-sdk");

/**
 * Función para construit el body del email
 * @param usedCodes
 * @param name
 * @returns {Promise<boolean>}
 */
const getBodyEmail = (usedCodes, name) => {
        return `<header></header>\n<body>\n<p>Códigos Bundle de FNAC del usuario - ${name}`
        + `Codigos Usados: <li>${usedCodes.map(code => `<ul>${code}</ul>`)}</li></p>\n<p><i><b>Por favor, `
        + 'no responda a este mensaje, ha sido enviado de forma automática.</b></i></p>\n</body>';    
}

/**
 * Función para enviar el email con los ids de bundle usados de un usuario
 * @param data
 * @returns {Promise<boolean>}
 */
const sendEmail = (data) => {
  const { email, name, usedCodes } = data;
  return new Promise(async (resolve, reject) => {
    const timestamp = Date.now();
    const date = new Date(timestamp).toDateString();
    let mail = 'From: pablo.g.martinez@ricoh.es\n';
    mail += `To: ${email}\n`;
    mail += `Subject: EL PAÍS + Podimo - Códigos redimidos ${date}\n`;
    mail += "MIME-Version: 1.0\n";
    mail += "Content-Type: multipart/mixed; boundary=\"Section\"\n\n";
    mail += "--Section\n";
    mail += "Content-Type: text/html; charset=utf-8\n\n";
    mail += `${getBodyEmail(usedCodes, name)}\n\n`;    
    const params = {
      RawMessage: { Data: mail }
    };
    const ses = new aws.SES();
    const sendResult = await ses.sendRawEmail(params).promise();
    sendResult ? resolve(true) : reject(false);
})};

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
    const resEmail = await sendEmail(event.body);  
    return resEmail
        ? await response(200, null, 'Email enviado correctamente con bundle codes asociados')
        : await response(400, null, 'El email no pudo enviarse');  
  } catch (error) {
    console.error(
      `::handler | Error al obtener las promociones bundle del usuario - err: ${error.message}`
    );
    return response(400, null, "Error al enviar el email con las promociones bundle");
  }
};
