// src/util/documentationSwag.ts
import { Application } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configures and serves Swagger UI with both JWT Bearer and Google OAuth2 (PKCE) support.
 */
export function setupSwagger(app: Application) {
  // Environment-driven base URLs
  const apiBase      = process.env.API_BASE_URL  || 'http://localhost:4000';
  const frontendBase = process.env.FRONTEND_URL  || 'http://localhost:5173';
  const googleClient = process.env.GOOGLE_CLIENT_ID!;

  // OpenAPI Definition
  const swaggerDefinition = {
    openapi: '3.0.1',
    info: {
      title:       'API Documentation',
      version:     '1.0.0',
      description: 'Complete API docs for Sheets, Campaigns, Ads, Keywords and Google OAuth2'
    },
    servers: [
      // Root routes (e.g. /auth/*)
      { url: apiBase,           description: 'Production Root Server' },
      { url: 'http://localhost:4000', description: 'Local Root Server' },
      // API routes under /api/*
      { url: `${apiBase}/api`,  description: 'Production API Server' },
      { url: 'http://localhost:4000', description: 'Local API Server' }
    ],
    tags: [
      { name: 'Auth',      description: 'Google OAuth2-login og brugerinfo' },
      { name: 'Sheets',    description: 'Operations on Google Sheets metadata' },
      { name: 'Campaigns', description: 'Operations on Campaign definitions' },
      { name: 'Ads',       description: 'Operations on Ad definitions' },
      { name: 'Keywords',  description: 'Operations on Keyword definitions' }
    ],
    components: {
      securitySchemes: {
        // JWT Bearer Authentication
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT'
        },
        // Google OAuth2 PKCE Authorization Code Flow
        googleOAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
              tokenUrl:         'https://oauth2.googleapis.com/token',
              scopes: {
                'https://www.googleapis.com/auth/userinfo.email':   'Læs brugerens e-mail',
                'https://www.googleapis.com/auth/userinfo.profile': 'Læs brugerens profil'
              }
            }
          }
        }
      },
      schemas: {
        // Your existing schemas
        Sheet: {
          type: 'object',
          properties: {
            _id:      { type: 'string', example: '60f7c2d1e25e4b3a2b1c4d5e' },
            sheetId:  { type: 'string', example: '1AbCxyz1234567890' },
            name:     { type: 'string', example: 'My Sheet' },
            sheetUrl: { type: 'string', example: 'https://docs.google.com/spreadsheets/d/1AbCxyz1234567890' },
            userId:   { type: 'string', example: '603d214f1c4ae9311ce2d799' }
          }
        },
        CampaignDef: { type: 'object', properties: { _id: { type: 'string' }, sheetId: { type: 'string' }, name: { type: 'string' }, status: { type: 'string' }, budget: { type: 'number' }, rowIndex: { type: 'integer' } } },
        AdDef:       { type: 'object', properties: { _id: { type: 'string' }, sheetId: { type: 'string' }, adGroup: { type: 'string' }, headline1: { type: 'string' }, headline2: { type: 'string' }, description: { type: 'string' }, finalUrl: { type: 'string' } } },
        KeywordDef:  { type: 'object', properties: { _id: { type: 'string' }, sheetId: { type: 'string' }, keyword: { type: 'string' }, matchType: { type: 'string' }, cpc: { type: 'number' } } },
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
        GoogleAuthResponse: { type: 'object', properties: { message: { type: 'string', example: 'Login OK' }, token: { type: 'string', example: 'eyJhbGciOiJI…' }, user: { $ref: '#/components/schemas/User' } } }
      }
    },
    security: [
      { bearerAuth: []  },
      { googleOAuth: [] }
    ]
  };

  // Generate Swagger spec
  const swaggerSpec = swaggerJsdoc({
    definition: swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/controllers/*.ts']
  });

  // Serve oauth2-redirect.html via express
  app.get('/oauth2-redirect.html', (_req, res) => {
    res.sendFile(
      path.join(__dirname, '../../node_modules/swagger-ui-dist/oauth2-redirect.html')
    );
  });

  // Mount Swagger UI with OAuth2 settings
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        oauth2RedirectUrl: `${frontendBase}/oauth2-redirect.html`,
        oauth: {
          clientId:                           googleClient,
          usePkceWithAuthorizationCodeGrant: true
        }
      }
    })
  );
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
//     description: 'Complete API documentation for Sheets, Campaigns, Ads, Keywords and Google OAuth'
//   },
//   servers: [
//     { url: 'http://localhost:4000/api', description: 'Local server' }
//   ],
//   tags: [
//     { name: 'Sheets', description: 'Operations on Google Sheets metadata' },
//     { name: 'Campaigns', description: 'Operations on Campaign definitions' },
//     { name: 'Ads', description: 'Operations on Ad definitions' },
//     { name: 'Keywords', description: 'Operations on Keyword definitions' },
//     { name: 'Auth', description: 'Google OAuth2-login og brugerinfo' }
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
//           _id:       { type: 'string', example: '60f7c2d1e25e4b3a2b1c4d5e' },
//           sheetId:   { type: 'string', example: '1AbCxyz1234567890' },
//           name:      { type: 'string', example: 'My Sheet' },
//           sheetUrl:  { type: 'string', example: 'https://docs.google.com/spreadsheets/d/1AbCxyz1234567890' },
//           userId:    { type: 'string', example: '603d214f1c4ae9311ce2d799' }
//         }
//       },
//       CampaignDef: {
//         type: 'object',
//         properties: {
//           _id:      { type: 'string' },
//           sheetId:  { type: 'string' },
//           name:     { type: 'string' },
//           status:   { type: 'string' },
//           budget:   { type: 'number' },
//           rowIndex: { type: 'integer' }
//         }
//       },
//       AdDef: {
//         type: 'object',
//         properties: {
//           _id:       { type: 'string' },
//           sheetId:   { type: 'string' },
//           adGroup:   { type: 'string' },
//           headline1: { type: 'string' },
//           headline2: { type: 'string' },
//           description: { type: 'string' },
//           finalUrl:  { type: 'string' }
//         }
//       },
//       KeywordDef: {
//         type: 'object',
//         properties: {
//           _id:       { type: 'string' },
//           sheetId:   { type: 'string' },
//           keyword:   { type: 'string' },
//           matchType: { type: 'string' },
//           cpc:       { type: 'number' }
//         }
//       },
//       User: {
//         type: 'object',
//         properties: {
//           _id:          { type: 'string', example: '650a1c2dbf1e4a1a1f2c3d4e' },
//           email:        { type: 'string', format: 'email', example: 'nanna@example.com' },
//           googleId:     { type: 'string', example: '117123456789012345678' },
//           refreshToken: { type: 'string', example: 'ya29.a0ARrdaM…' },
//           accessToken:  { type: 'string', example: 'ya29.a0ARrdaF…' },
//           iat:          { type: 'integer', example: 1690000000 },
//           exp:          { type: 'integer', example: 1690604800 }
//         }
//       },
//       GoogleAuthResponse: {
//         type: 'object',
//         properties: {
//           message: { type: 'string', example: 'Login OK' },
//           token:   { type: 'string', example: 'eyJhbGciOiJI…' },
//           user:    { $ref: '#/components/schemas/User' }
//         }
//       }
//     }
//   },
//   security: [{ bearerAuth: [] }]
// }

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


