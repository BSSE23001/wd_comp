export const swaggerDocs = {
  openapi: "3.0.0",
  info: { title: "Monorepo API", version: "1.0.0" },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/posts": {
      get: {
        summary: "Get all posts",
        responses: { "200": { description: "List of posts" } },
      },
      post: {
        summary: "Create post",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/posts/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get post by ID",
        responses: { "200": { description: "Post object" } },
      },
      put: {
        summary: "Update post",
        responses: { "200": { description: "Updated" } },
      },
      delete: {
        summary: "Delete post",
        responses: { "200": { description: "Deleted" } },
      },
    },
  },
};
