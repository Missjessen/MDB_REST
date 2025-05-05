// src/util/documentationSwag.ts
import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';


const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'Complete API documentation for Sheets, Campaigns, Ads, Keywords'
  },
  servers: [
    { url: 'http://localhost:4000/api', description: 'Local server' }
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
          _id: { type: 'string', example: '60f7c2d1e25e4b3a2b1c4d5e' },
          sheetId: { type: 'string', example: '1AbCxyz1234567890' },
          name: { type: 'string', example: 'My Sheet' },
          sheetUrl: { type: 'string', example: 'https://docs.google.com/spreadsheets/d/1AbCxyz1234567890' },
          userId: { type: 'string', example: '603d214f1c4ae9311ce2d799' }
        }
      },
      CampaignDef: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          sheetId: { type: 'string' },
          name: { type: 'string' },
          status: { type: 'string' },
          budget: { type: 'number' },
          rowIndex: { type: 'integer' }
        }
      },
      AdDef: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          sheetId: { type: 'string' },
          adGroup: { type: 'string' },
          headline1: { type: 'string' },
          headline2: { type: 'string' },
          description: { type: 'string' },
          finalUrl: { type: 'string' }
        }
      },
      KeywordDef: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          sheetId: { type: 'string' },
          keyword: { type: 'string' },
          matchType: { type: 'string' },
          cpc: { type: 'number' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }]
};

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


// import swaggerUi from 'swagger-ui-express';
// import swaggerJsdoc from 'swagger-jsdoc';
// import { Application } from 'express';

// /**
//  * Setup Swagger documentation
//  * @param app setup documentation swagger
//  */
// export function setupSwagger(app: Application) {
//     const swaggerDefinition = {
//         openapi: '3.0.0',
//         info: {
//             title: 'API Documentation',
//             version: '1.0.0',
//             description: 'API Documentation for the API',
//         },
//         servers: [
//             {
//                 url: 'http://localhost:4000/api/',
//                 description: 'Development server',
//             },
//             {
//                 url: 'https://mdb-rest.onrender.com/api/docs',
//                 description: 'Remote render.com server',
//             },
//         ],
//         components: {
//             securitySchemes: {
//                 ApiKeyAuth: {
//                     type: 'apiKey',
//                     in: 'header',
//                     name: 'auth-token',
//                 },
//             },
//             schemas: {  
//                 product: {
//                     type: 'object',
//                     properties: {
//                         name: { type: 'string' },
//                         description: { type: 'string' },
//                         imageURL: { type: 'string' },
//                         price: { type: 'number' },
//                         stock: { type: 'number' },
//                         isONdiscount: { type: 'boolean' },
//                         discountPct: { type: 'number' },
//                         isHidden: { type: 'boolean' },
//                         _createdBy: { 
//                             type: 'string',
//                             format: 'uuid',
//                             example: '123e4567-e89b-12d3-a456-426614174000'
//                         },
//                     },
//                 },
//                 user: {
//                     type: 'object',
//                     properties: {
//                         name: { type: 'string' },
//                         email: { type: 'string' },
//                         password: { type: 'string' },
//                     },
//                 },
//                 event: {
//                     type: 'object',
//                     properties: {
//                         title: { type: 'string' },
//                         eventDate: { 
//                             type: 'string', 
//                             format: 'date-time',
//                             example: '2025-04-01T18:00:00+01:00'
//                         },
//                         eventLocation: { type: 'string' },
//                         description: { type: 'string' },
//                         maxAttendees: { type: 'number' },
//                         attendees: { 
//                             type: 'array', 
//                             items: { type: 'string' } 
//                         }, 
//                         imageURL: { type: 'string' },
//                         createdBy: { type: 'string' },
//                     },
//                 },
//             },
//         },
//     };

//     const options = {
//         swaggerDefinition,
//         apis: ['./src/views/*.ts'], // Matcher dine route-filer
//       };
      
//       const swaggerSpec = swaggerJsdoc(options);
//       app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// }


    
