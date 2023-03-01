const lambda = require("aws-cdk-lib/aws-lambda");
const iam = require("aws-cdk-lib/aws-iam");


/**
  * Configura y crea un nuevo stack de una Lambda
*/

const createLambdaInstances = async (name, resource, description, this) => {

  
     // **************** PARA SUBIR LAMBDA CON ROLE, LAYERS Y VARIABLES DE ENTORNO ****************
     const lambdaExecRole = iam.Role.fromRoleArn(
        this,
        'lambdaExecRole',
        'arn:aws:iam::832857168964:role/arcsubscriptions-lambdaExecute',
        {mutable: false}
      );
  
      const layerLibraries = lambda.LayerVersion.fromLayerVersionArn(
        this,
        "librariesLayer",
        "arn:aws:lambda:eu-west-1:832857168964:layer:arcsubscriptions-layer-libraries:367"
      );
      const layerZip = lambda.LayerVersion.fromLayerVersionArn(
        this,
        "zipLayer",
        "arn:aws:lambda:eu-west-1:832857168964:layer:arcsubscriptions-layer-layerZip:291"
      );
      const layerSOAP = lambda.LayerVersion.fromLayerVersionArn(
        this,
        "soapLayer",
        "arn:aws:lambda:eu-west-1:832857168964:layer:arcsubscriptions-layer-layerSOAP:357"
      );
  
      new lambda.Function(this, name, {
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset(`resources/${resource}`),
        handler: "index.handler",
        role: lambdaExecRole,
        environment: {
          /* BUNDLE_CODES_DB: "arcsubscriptions-bundleCodes",
          REUSABLE_BUNDLE_CODES_DB: "arcsubscriptions-reusableBundleCodes",
          ARC_ENVIRONMENT: "api.sandbox.prisa.arcpublishing.com",
          developerToken: "AEH2I9D0IKIM5HDM7EAU4153GTM1MVEJdT7hJRz0/ciCxA4Seu3lnjlYDo/0AH24EyMkzhDF", */
        },
        layers: [layerLibraries, layerZip, layerSOAP],
        description: `lambda temporal tarea prueba ${description}`,
        timeout: Duration.seconds(10),
        memorySize: 128,
      });  
};

module.exports = {createLambdaInstances}
