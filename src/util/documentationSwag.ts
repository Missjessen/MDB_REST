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
                url: 'http://localhost:4000/api/',
                description: 'Development server',
            },
            {
                url: 'https://mdb-rest.onrender.com/api/',
                description: 'Remote render.com server',
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
            schemas: {  
                Product: {
                    type: 'object',
                  properties: {
                            name: { type: 'string', example: 'Smartphone X' },
                            description: { type: 'string', example: 'High-end smartphone with 256GB storage' },
                            price: { type: 'number', example: 999.99 },
                            stock: { type: 'number', example: 50 },
                            isONdiscount: { type: 'boolean', example: true },
                            discountPct: { type: 'number', example: 10 },
                            isHidden: { type: 'boolean', example: false },
                            imageURL: { type: 'string', example: 'https://example.com/image.jpg' },
                            _createdBy: { type: 'string', example: 'user12345' },
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
                        id: {
                            type: 'string',
                            description: 'Unique identifier for the event',
                        },
                        title: {
                            type: 'string',
                            description: 'Title of the event',
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description of the event',
                        },
                        date: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Date and time of the event',
                        },
                        eventlocation: {
                            type: 'string',
                            description: 'Location of the event',
                        },
                        maxAttendees: {
                            type: 'number',
                            description: 'Maximum number of attendees',
                        },
                        attendees: {
                            type: 'array',
                            description: 'List of attendees',
                            items: {
                                type: 'string',
                            },
                        },
                        imageURL: {
                            type: 'string',
                            description: 'URL of the event image',
                        },
                        createdBy: {
                            type: 'string',
                            description: 'User ID of the event creator',
                        },
                    },
                },
                
                },
            }, 
         
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
