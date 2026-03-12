export function getOpenApiSpec() {
  return {
    openapi: "3.0.3",
    info: {
      title: "PantryClip API",
      version: "0.1.0",
      description: "MVP API for PantryClip recipe capture and management"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development"
      }
    ],
    tags: [
      { name: "Health" },
      { name: "Recipes" }
    ],
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": {
              description: "Service health",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthStatus" }
                }
              }
            }
          }
        }
      },
      "/api/recipes/summarize": {
        post: {
          tags: ["Recipes"],
          summary: "Generate an AI recipe draft from source URL",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SummarizeRecipeRequest" }
              }
            }
          },
          responses: {
            "200": {
              description: "Draft generated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SummarizeRecipeResponse" }
                }
              }
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/api/recipes": {
        get: {
          tags: ["Recipes"],
          summary: "List recipes",
          parameters: [
            {
              name: "q",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Title search query"
            },
            {
              name: "cursor",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Opaque pagination cursor"
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
              description: "Page size"
            }
          ],
          responses: {
            "200": {
              description: "Paginated recipes",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ListRecipesResponse" }
                }
              }
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        },
        post: {
          tags: ["Recipes"],
          summary: "Create a recipe",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateRecipeRequest" }
              }
            }
          },
          responses: {
            "201": {
              description: "Created recipe",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Recipe" }
                }
              }
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/api/recipes/{id}": {
        get: {
          tags: ["Recipes"],
          summary: "Get recipe detail",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            }
          ],
          responses: {
            "200": {
              description: "Recipe detail",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Recipe" }
                }
              }
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        },
        patch: {
          tags: ["Recipes"],
          summary: "Update recipe",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateRecipeRequest" }
              }
            }
          },
          responses: {
            "200": {
              description: "Updated recipe",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Recipe" }
                }
              }
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        },
        delete: {
          tags: ["Recipes"],
          summary: "Delete recipe",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            }
          ],
          responses: {
            "200": {
              description: "Delete result",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DeleteRecipeResponse" }
                }
              }
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        SourceType: {
          type: "string",
          enum: ["youtube_shorts", "instagram_reels", "other"]
        },
        SummarySource: {
          type: "string",
          enum: ["manual", "ai"]
        },
        HealthStatus: {
          type: "object",
          required: ["ok", "service", "timestamp", "uptimeSec"],
          properties: {
            ok: { type: "boolean" },
            service: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            uptimeSec: { type: "number" }
          }
        },
        ErrorResponse: {
          type: "object",
          required: ["code", "message"],
          properties: {
            code: { type: "string" },
            message: { type: "string" },
            details: {}
          }
        },
        Recipe: {
          type: "object",
          required: [
            "id",
            "userId",
            "sourceUrl",
            "sourceType",
            "title",
            "ingredientsText",
            "stepsText",
            "summarySource",
            "aiConfidence",
            "createdAt",
            "updatedAt"
          ],
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string" },
            sourceUrl: { type: "string", format: "uri" },
            sourceType: { $ref: "#/components/schemas/SourceType" },
            title: { type: "string", minLength: 1, maxLength: 140 },
            ingredientsText: { type: "string", minLength: 1 },
            stepsText: { type: "string", minLength: 1 },
            summarySource: { $ref: "#/components/schemas/SummarySource" },
            aiConfidence: { type: "number", minimum: 0, maximum: 1, nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        SummarizeRecipeRequest: {
          type: "object",
          required: ["sourceUrl"],
          properties: {
            sourceUrl: { type: "string", format: "uri" }
          }
        },
        SummarizeRecipeResponse: {
          type: "object",
          required: ["sourceType", "titleDraft", "ingredientsDraft", "stepsDraft"],
          properties: {
            sourceType: { $ref: "#/components/schemas/SourceType" },
            titleDraft: { type: "string" },
            ingredientsDraft: { type: "string" },
            stepsDraft: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 }
          }
        },
        CreateRecipeRequest: {
          type: "object",
          required: [
            "sourceUrl",
            "sourceType",
            "title",
            "ingredientsText",
            "stepsText",
            "summarySource"
          ],
          properties: {
            sourceUrl: { type: "string", format: "uri" },
            sourceType: { $ref: "#/components/schemas/SourceType" },
            title: { type: "string", minLength: 1, maxLength: 140 },
            ingredientsText: { type: "string", minLength: 1 },
            stepsText: { type: "string", minLength: 1 },
            summarySource: { $ref: "#/components/schemas/SummarySource" },
            aiConfidence: { type: "number", minimum: 0, maximum: 1, nullable: true }
          }
        },
        UpdateRecipeRequest: {
          type: "object",
          minProperties: 1,
          properties: {
            sourceUrl: { type: "string", format: "uri" },
            sourceType: { $ref: "#/components/schemas/SourceType" },
            title: { type: "string", minLength: 1, maxLength: 140 },
            ingredientsText: { type: "string", minLength: 1 },
            stepsText: { type: "string", minLength: 1 },
            summarySource: { $ref: "#/components/schemas/SummarySource" },
            aiConfidence: { type: "number", minimum: 0, maximum: 1, nullable: true }
          }
        },
        ListRecipesResponse: {
          type: "object",
          required: ["items"],
          properties: {
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/Recipe" }
            },
            nextCursor: { type: "string" }
          }
        },
        DeleteRecipeResponse: {
          type: "object",
          required: ["ok"],
          properties: {
            ok: { type: "boolean", enum: [true] }
          }
        }
      }
    }
  };
}
