// src/util/documentationSwag.ts
import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'Complete API documentation for Sheets, Campaigns, Ads, Keywords and Google OAuth'
  },
  servers: [
    { url: 'http://localhost:4000/api', description: 'Local server' }
  ],
  tags: [
    { name: 'Sheets', description: 'Operations on Google Sheets metadata' },
    { name: 'Campaigns', description: 'Operations on Campaign definitions' },
    { name: 'Ads', description: 'Operations on Ad definitions' },
    { name: 'Keywords', description: 'Operations on Keyword definitions' },
    { name: 'Auth', description: 'Google OAuth2-login og brugerinfo' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Sheet: {
        type: 'object',
        properties: {
          _id:       { type: 'string', example: '60f7c2d1e25e4b3a2b1c4d5e' },
          sheetId:   { type: 'string', example: '1AbCxyz1234567890' },
          name:      { type: 'string', example: 'My Sheet' },
          sheetUrl:  { type: 'string', example: 'https://docs.google.com/spreadsheets/d/1AbCxyz1234567890' },
          userId:    { type: 'string', example: '603d214f1c4ae9311ce2d799' }
        }
      },
      CampaignDef: {
        type: 'object',
        properties: {
          _id:      { type: 'string' },
          sheetId:  { type: 'string' },
          name:     { type: 'string' },
          status:   { type: 'string' },
          budget:   { type: 'number' },
          rowIndex: { type: 'integer' }
        }
      },
      AdDef: {
        type: 'object',
        properties: {
          _id:       { type: 'string' },
          sheetId:   { type: 'string' },
          adGroup:   { type: 'string' },
          headline1: { type: 'string' },
          headline2: { type: 'string' },
          description: { type: 'string' },
          finalUrl:  { type: 'string' }
        }
      },
      KeywordDef: {
        type: 'object',
        properties: {
          _id:       { type: 'string' },
          sheetId:   { type: 'string' },
          keyword:   { type: 'string' },
          matchType: { type: 'string' },
          cpc:       { type: 'number' }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id:          { type: 'string', example: '650a1c2dbf1e4a1a1f2c3d4e' },
          email:        { type: 'string', format: 'email', example: 'nanna@example.com' },
          googleId:     { type: 'string', example: '117123456789012345678' },
          refreshToken: { type: 'string', example: 'ya29.a0ARrdaM…' },
          accessToken:  { type: 'string', example: 'ya29.a0ARrdaF…' },
          iat:          { type: 'integer', example: 1690000000 },
          exp:          { type: 'integer', example: 1690604800 }
        }
      },
      GoogleAuthResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Login OK' },
          token:   { type: 'string', example: 'eyJhbGciOiJI…' },
          user:    { $ref: '#/components/schemas/User' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }]
}

const options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Application) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}


// // src/util/documentationSwag.ts
// import { Application } from 'express';
// import swaggerUi from 'swagger-ui-express';
// import swaggerJsdoc from 'swagger-jsdoc';


// const swaggerDefinition = {
//   openapi: '3.0.0',
//   info: {
//     title: 'API Documentation',
//     version: '1.0.0',
//     description: 'Complete API documentation for Sheets, Campaigns, Ads, Keywords'
//   },
//   servers: [
//     { url: 'http://localhost:4000/api', description: 'Local server' }
//   ],
//   components: {
//     securitySchemes: {
//       bearerAuth: {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT'
//       }
//     },
//     schemas: {
//       Sheet: {
//         type: 'object',
//         properties: {
//           _id: { type: 'string', example: '60f7c2d1e25e4b3a2b1c4d5e' },
//           sheetId: { type: 'string', example: '1AbCxyz1234567890' },
//           name: { type: 'string', example: 'My Sheet' },
//           sheetUrl: { type: 'string', example: 'https://docs.google.com/spreadsheets/d/1AbCxyz1234567890' },
//           userId: { type: 'string', example: '603d214f1c4ae9311ce2d799' }
//         }
//       },
//       CampaignDef: {
//         type: 'object',
//         properties: {
//           _id: { type: 'string' },
//           sheetId: { type: 'string' },
//           name: { type: 'string' },
//           status: { type: 'string' },
//           budget: { type: 'number' },
//           rowIndex: { type: 'integer' }
//         }
//       },
//       AdDef: {
//         type: 'object',
//         properties: {
//           _id: { type: 'string' },
//           sheetId: { type: 'string' },
//           adGroup: { type: 'string' },
//           headline1: { type: 'string' },
//           headline2: { type: 'string' },
//           description: { type: 'string' },
//           finalUrl: { type: 'string' }
//         }
//       },
//       KeywordDef: {
//         type: 'object',
//         properties: {
//           _id: { type: 'string' },
//           sheetId: { type: 'string' },
//           keyword: { type: 'string' },
//           matchType: { type: 'string' },
//           cpc: { type: 'number' }
//         }
//       }
//     }
//   },
//   security: [{ bearerAuth: [] }]
// };

// const options = {
//   swaggerDefinition,
//   apis: [
//     './src/routes/*.ts',
//     './src/controllers/*.ts'
//   ]
// };

// const swaggerSpec = swaggerJsdoc(options);

// export function setupSwagger(app: Application) {
//   app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// }


