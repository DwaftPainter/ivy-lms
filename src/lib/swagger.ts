import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api', 
    definition: {
      openapi: '3.0.0',
      info: { title: 'Ivy LMS API', version: '1.0.0' },
      components: {
        schemas: {
          // Shared User Schema (excluding sensitive fields)
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              role: { type: 'string', enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          // Shared Error Schema based on your code structure
          ErrorResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  });
  return spec;
};