// src/util/documentationSwag.ts
import { Application } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configures and serves Swagger UI with JWT Bearer and Google OAuth2 (PKCE) support,
 * covering all /auth/* and /api/* routes.
 */
export function setupSwagger(app: Application) {
  // 1) Miljø-variabler
  const apiBase        = process.env.API_BASE_URL     || 'http://localhost:4000';
  const googleClientId = process.env.GOOGLE_CLIENT_ID!;

  // 2) OpenAPI-definition
  const swaggerDefinition = {
    openapi: '3.0.1',
    info: {
      title:       'API Documentation',
      version:     '1.0.0',
      description: 'Dokumentation for Auth, Sheets, Campaigns, Ads, Keywords & Google OAuth2'
    },
    servers: [
      { url: apiBase,           description: 'Root Server (Auth & Docs)' },
      { url: `${apiBase}/api`,  description: 'API Server (Protected)' },
      { url: 'http://localhost:4000',     description: 'Local Root' },
      { url: 'http://localhost:4000/api', description: 'Local API' }
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
        // JWT-Bearer for dine /api/*-endpoints
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT'
        },
        // Google OAuth2 PKCE flow for Swagger UI
        googleOAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              // 1) Swagger UI trækker denne URL for at starte Google-flowet
              authorizationUrl: `${apiBase}/auth/google`,
              // 2) Swagger UI poster { code, codeVerifier } her for at få tokens retur
              tokenUrl:         `${apiBase}/auth/token`,
              scopes: {
                'https://www.googleapis.com/auth/adwords':          'Google Ads API',
                'https://www.googleapis.com/auth/spreadsheets':     'Google Sheets API',
                'https://www.googleapis.com/auth/drive.file':       'Read+write Drive files',
                'https://www.googleapis.com/auth/drive.readonly':   'Read-only Drive',
                'https://www.googleapis.com/auth/userinfo.email':   'Læs brugerens e-mail',
                'https://www.googleapis.com/auth/userinfo.profile': 'Læs brugerens profil'
              }
            }
          }
        }
      },
      schemas: {
        Sheet: {
          type: 'object',
          properties: {
            _id:      { type: 'string', example: '60f7c2d1e25e4b3a2b1c4d5e' },
            sheetId:  { type: 'string', example: '1AbCxyz1234567890' },
            name:     { type: 'string', example: 'My Sheet' },
            sheetUrl: { type: 'string', example: 'https://docs.google.com/spreadsheets/d/...' },
            userId:   { type: 'string', example: '603d214f1c4ae9311ce2d799' }
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
            _id:         { type: 'string' },
            sheetId:     { type: 'string' },
            adGroup:     { type: 'string' },
            headline1:   { type: 'string' },
            headline2:   { type: 'string' },
            description: { type: 'string' },
            finalUrl:    { type: 'string' }
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
            message:     { type: 'string', example: 'Login OK' },
            token:       { type: 'string', example: 'eyJhbGciOiJI…' },
            accessToken: { type: 'string', example: 'ya29.a0ARrdaM…' },
            user:        { $ref: '#/components/schemas/User' }
          }
        }
      }
    },
    security: [
      { googleOAuth: [] },
      { bearerAuth:  [] }
    ]
  };

  // 3) Generér OpenAPI-spec
  const swaggerSpec = swaggerJsdoc({
    definition: swaggerDefinition,
    apis: [
      path.join(__dirname, '../routes/*.ts'),
      path.join(__dirname, '../controllers/*.ts')
    ]
  });

  // 4) Servér statisk oauth2-redirect.html fra swagger-ui-dist
  app.get('/oauth2-redirect.html', (_req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../../node_modules/swagger-ui-dist/oauth2-redirect.html'
      )
    );
  });

  // 5) Mount Swagger UI på /docs
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        // Slå deepLinking advarsel fra
        deepLinking: false,
        // Peg på backend’s redirect
        oauth2RedirectUrl: `${apiBase}/oauth2-redirect.html`,
        oauth: {
          clientId:                            googleClientId,
          usePkceWithAuthorizationCodeGrant:   true,
          useBasicAuthenticationWithAccessCodeGrant: false
        }
      }
    })
  );
}
