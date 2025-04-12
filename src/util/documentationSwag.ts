import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Application } from 'express';

/**
 * Setup Swagger documentation
 * @param app setup documentation swagger
 */
export function setupSwagger(app: Application) {
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
                url: 'https://mdb-rest.onrender.com/api/docs',
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
                product: {
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
                        _createdBy: { 
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                    },
                },
                user: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        email: { type: 'string' },
                        password: { type: 'string' },
                    },
                },
                event: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        eventDate: { 
                            type: 'string', 
                            format: 'date-time',
                            example: '2025-04-01T18:00:00+01:00'
                        },
                        eventLocation: { type: 'string' },
                        description: { type: 'string' },
                        maxAttendees: { type: 'number' },
                        attendees: { 
                            type: 'array', 
                            items: { type: 'string' } 
                        }, 
                        imageURL: { type: 'string' },
                        createdBy: { type: 'string' },
                    },
                },
            },
        },
    };

    const options = {
        swaggerDefinition,
        apis: ['./src/views/*.ts'], // Matcher dine route-filer
      };
      
      const swaggerSpec = swaggerJsdoc(options);
      app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}


    
