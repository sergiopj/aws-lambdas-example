const { Stack, Duration, RemovalPolicy } = require("aws-cdk-lib");
// const sqs = require('aws-cdk-lib/aws-sqs');
const lambda = require("aws-cdk-lib/aws-lambda");
const iam = require("aws-cdk-lib/aws-iam");
const sfn = require("aws-cdk-lib/aws-stepfunctions");
const s3 = require("aws-cdk-lib/aws-s3");
const fs = require("fs");
const path = require('path');

class LambdasDesplieguesIntStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

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

    // TODO hacerlo dinamico
    new lambda.Function(this, "prueba-sergio-emailverified", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("resources/emailVerified"),
      handler: "index.handler",
      role: lambdaExecRole,
      environment: {
        /* BUNDLE_CODES_DB: "arcsubscriptions-bundleCodes",
        REUSABLE_BUNDLE_CODES_DB: "arcsubscriptions-reusableBundleCodes",
        ARC_ENVIRONMENT: "api.sandbox.prisa.arcpublishing.com",
        developerToken: "AEH2I9D0IKIM5HDM7EAU4153GTM1MVEJdT7hJRz0/ciCxA4Seu3lnjlYDo/0AH24EyMkzhDF", */
      },
      layers: [layerLibraries, layerZip, layerSOAP],
      description: "lambda temporal tarea prueba consulta email usuario",
      timeout: Duration.seconds(10),
      memorySize: 128,
    });

    new lambda.Function(this, "prueba-sergio-getSubs", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("resources/getSubscriptions"),
      handler: "index.handler",
      role: lambdaExecRole,
      environment: {
        /* BUNDLE_CODES_DB: "arcsubscriptions-bundleCodes",
        REUSABLE_BUNDLE_CODES_DB: "arcsubscriptions-reusableBundleCodes",
        ARC_ENVIRONMENT: "api.sandbox.prisa.arcpublishing.com",
        developerToken: "AEH2I9D0IKIM5HDM7EAU4153GTM1MVEJdT7hJRz0/ciCxA4Seu3lnjlYDo/0AH24EyMkzhDF", */
      },
      layers: [layerLibraries, layerZip, layerSOAP],
      description: "lambda temporal tarea prueba get subscriptions bundle codes usuario",
      timeout: Duration.seconds(10),
      memorySize: 128,
    });

    new lambda.Function(this, "prueba-sergio-sendEmail", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("resources/sendEmailWithCodes"),
      handler: "index.handler",
      role: lambdaExecRole,
      environment: {
        /* BUNDLE_CODES_DB: "arcsubscriptions-bundleCodes",
        REUSABLE_BUNDLE_CODES_DB: "arcsubscriptions-reusableBundleCodes",
        ARC_ENVIRONMENT: "api.sandbox.prisa.arcpublishing.com",
        developerToken: "AEH2I9D0IKIM5HDM7EAU4153GTM1MVEJdT7hJRz0/ciCxA4Seu3lnjlYDo/0AH24EyMkzhDF", */
      },
      layers: [layerLibraries, layerZip, layerSOAP],
      description: "lambda temporal tarea prueba send email with bundle codes",
      timeout: Duration.seconds(10),
      memorySize: 128,
    });

    // **************** PARA SUBIR STATE MACHINE DEFINIDA EN UN FICHERO ****************
    console.log('test  ', path.join(__dirname, '../resources/state_machine.json'))
    const stateMachineDef = fs.readFileSync(
      path.join(__dirname, '../resources/state_machine.json'),
      { encoding: 'utf-8' }
    );

    new sfn.CfnStateMachine(this, 'state-machine-test-sergio', {
      roleArn: 'arn:aws:iam::832857168964:role/arcsubscriptions-smExecute',
      definitionString: stateMachineDef,
    });
 
    // ********************** PARA CREAR UN BUCKET EN S3 **********************
    /* const bucket = new s3.Bucket(this, 'dataBucket', {
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });
    bucket.grantRead(new iam.AccountRootPrincipal);
    bucket.grantWrite(new iam.AccountRootPrincipal); */
  }
}

module.exports = { LambdasDesplieguesIntStack };
