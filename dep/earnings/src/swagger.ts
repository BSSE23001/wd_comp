import swaggerJsDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Earnings Service API", version: "1.0.0" },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        internalApiKey: {
          type: "apiKey",
          in: "header",
          name: "x-internal-api-key",
        },
      },
    },
  },
  apis: ["./src/routes.ts", "./src/controllers/*.ts"], // Adjust to where your JSDoc annotations live
};

export const swaggerSpec = swaggerJsDoc(options);
