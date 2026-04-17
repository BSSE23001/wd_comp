export declare const swaggerDocs: {
    openapi: string;
    info: {
        title: string;
        version: string;
    };
    components: {
        securitySchemes: {
            bearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
            };
        };
    };
    security: {
        bearerAuth: never[];
    }[];
    paths: {
        "/api/posts": {
            get: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
            post: {
                summary: string;
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: string;
                                properties: {
                                    title: {
                                        type: string;
                                    };
                                    content: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    "201": {
                        description: string;
                    };
                };
            };
        };
        "/api/posts/{id}": {
            parameters: {
                name: string;
                in: string;
                required: boolean;
                schema: {
                    type: string;
                };
            }[];
            get: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
            put: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
            delete: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=swagger.d.ts.map