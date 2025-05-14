// src/util/documentationSwag.ts
import { Application, Request, Response } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

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
      { url: apiBase,          description: 'Root Server (Auth & Docs)' },
      { url: `${apiBase}/api`, description: 'API Server (Protected)' }
    ],
    tags: [
      { name: 'Auth',      description: 'Google OAuth2-login og brugerinfo' },
      { name: 'Sheets',    description: 'Google Sheets metadata' },
      { name: 'Campaigns', description: 'Campaign definitions' },
      { name: 'Ads',       description: 'Ad definitions' },
      { name: 'Keywords',  description: 'Keyword definitions' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT'
        },
        googleOAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: `${apiBase}/auth/google`,
              tokenUrl:         `${apiBase}/auth/token`,
              scopes: {
                'https://www.googleapis.com/auth/adwords':        'Google Ads API',
                'https://www.googleapis.com/auth/spreadsheets':   'Google Sheets API',
                'https://www.googleapis.com/auth/drive.file':     'Drive file access',
                'https://www.googleapis.com/auth/drive.readonly': 'Drive read-only access',
                'https://www.googleapis.com/auth/userinfo.email': 'Læs brugerens e-mail',
                'https://www.googleapis.com/auth/userinfo.profile':'Læs brugerens profil'
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

  // 4) Serve oauth2-redirect.html med en fuld, absolut sti
  const redirectHtml = path.resolve(
    __dirname,
    '../../node_modules/swagger-ui-dist/oauth2-redirect.html'
  );
  app.get('/oauth2-redirect.html', (_req: Request, res: Response) => {
    res.sendFile(redirectHtml);
  });

  // 5) Mount Swagger UI på /docs
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        deepLinking: false,
        oauth2RedirectUrl: `${apiBase}/oauth2-redirect.html`,
        oauth: {
          clientId:                          googleClientId,
          usePkceWithAuthorizationCodeGrant: true,
          useBasicAuthenticationWithAccessCodeGrant: false
        }
      }
    })
  );
}