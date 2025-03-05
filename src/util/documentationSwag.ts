import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Application } from 'express';

/**
 * 
 * @param app setup documentation swagger
 */

export function setupSwagger(app: Application) {
   

    // Swagger definition
    const swaggerDefinition = {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API Documentation for the API',
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'auth-token',
                },
            },
            schemas: {  // Rettet fra "schema" til "schemas"
                Product: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        imageURL: { type: 'string' },
                        price: { type: 'number' },
                        stock: { type: 'number' },
                        isONdiscount: { type: 'boolean' },
                        discountPct: { type: 'number' },
                        isHidden: { type: 'boolean' },
                        _createdBy: { type: 'string' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        email: { type: 'string' },
                        password: { type: 'string' },
                    },
                },
                Event: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        date: { type: 'string' },
                        eventlocation: { type: 'string' },
                        description: { type: 'string' },
                        maxAttendees: { type: 'number' },
                        attendees: { type: 'array', items: { type: 'string' } }, // Rettet manglende "items" i array
                        imageURL: { type: 'string' },
                        createdBy: { type: 'string' },
                    },
                },
            }, // Lukkede "schemas" objektet korrekt
        }, // Lukkede "components" objektet korrekt
    }; 

    // Options for the swagger docs
    const options = {
        swaggerDefinition,
        apis: ['**/*.ts'], // Rettet fra "api" til "apis" (swaggerJsdoc bruger 'apis')
    };

    // Swagger spec
    const swaggerSpec = swaggerJsdoc(options);

    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
