import { extendZodWithOpenApi,OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  createRecipeSchema,
  listRecipesQuerySchema,
  sourceTypeSchema,
  summarizeRecipeSchema,
  summarySourceSchema,
  updateRecipeSchema
} from "@/src/apps/recipes/recipes.schemas";
import { APP_CONFIG } from "@/src/config/app";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const errorResponseSchema = registry.register(
  "ErrorResponse",
  z.object({
    code: z
      .enum(["UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "VALIDATION_ERROR", "INTERNAL_ERROR"])
      .openapi({ example: "VALIDATION_ERROR" }),
    message: z.string().openapi({ example: "Invalid request" }),
    details: z.unknown().optional()
  })
);

const healthStatusSchema = registry.register(
  "HealthStatus",
  z.object({
    ok: z.literal(true),
    service: z.string().openapi({ example: "pantry-clip-api" }),
    timestamp: z.string().datetime().openapi({ example: "2026-03-12T12:00:00.000Z" }),
    uptimeSec: z.number().openapi({ example: 123 })
  })
);

const sourceTypeOpenApiSchema = sourceTypeSchema.openapi("SourceType");
const summarySourceOpenApiSchema = summarySourceSchema.openapi("SummarySource");

const recipeSchema = registry.register(
  "Recipe",
  z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    sourceUrl: z.string().url(),
    sourceType: sourceTypeOpenApiSchema,
    title: z.string().min(1).max(140),
    ingredientsText: z.string().min(1),
    stepsText: z.string().min(1),
    summarySource: summarySourceOpenApiSchema,
    aiConfidence: z.number().min(0).max(1).nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
  })
);

const summarizeRecipeRequestSchema = summarizeRecipeSchema.openapi("SummarizeRecipeRequest");

const summarizeRecipeResponseSchema = registry.register(
  "SummarizeRecipeResponse",
  z.object({
    sourceType: sourceTypeOpenApiSchema,
    titleDraft: z.string(),
    ingredientsDraft: z.string(),
    stepsDraft: z.string(),
    confidence: z.number().min(0).max(1).optional()
  })
);

const createRecipeRequestSchema = createRecipeSchema.openapi("CreateRecipeRequest");
const updateRecipeRequestSchema = updateRecipeSchema.openapi("UpdateRecipeRequest", {
  description: "At least one field must be provided.",
  minProperties: 1
});

const listRecipesResponseSchema = registry.register(
  "ListRecipesResponse",
  z.object({
    items: z.array(recipeSchema),
    nextCursor: z.string().optional()
  })
);

const deleteRecipeResponseSchema = registry.register(
  "DeleteRecipeResponse",
  z.object({
    ok: z.literal(true)
  })
);

const recipeIdParamsSchema = z.object({
  id: z.string().uuid().openapi({
    param: {
      name: "id",
      in: "path"
    },
    example: "11111111-1111-1111-1111-111111111111"
  })
});

const listRecipesQueryOpenApiSchema = z.object({
  q: z.string().trim().optional().openapi({
    param: {
      name: "q",
      in: "query",
      description: "Title search query"
    },
    example: "pasta"
  }),
  cursor: z.string().trim().optional().openapi({
    param: {
      name: "cursor",
      in: "query",
      description: "Opaque pagination cursor"
    }
  }),
  limit: listRecipesQuerySchema.shape.limit.openapi({
    param: {
      name: "limit",
      in: "query",
      description: "Page size"
    },
    example: 20
  })
});

registry.registerPath({
  method: "get",
  path: "/api/health",
  tags: ["Health"],
  summary: "Health check",
  responses: {
    200: {
      description: "Service health",
      content: {
        "application/json": {
          schema: healthStatusSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/recipes/summarize",
  tags: ["Recipes"],
  summary: "Generate an AI recipe draft from source URL",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: summarizeRecipeRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Draft generated",
      content: {
        "application/json": {
          schema: summarizeRecipeResponseSchema
        }
      }
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/recipes",
  tags: ["Recipes"],
  summary: "List recipes",
  request: {
    query: listRecipesQueryOpenApiSchema
  },
  responses: {
    200: {
      description: "Paginated recipes",
      content: {
        "application/json": {
          schema: listRecipesResponseSchema
        }
      }
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/api/recipes",
  tags: ["Recipes"],
  summary: "Create a recipe",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createRecipeRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: "Created recipe",
      content: {
        "application/json": {
          schema: recipeSchema
        }
      }
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/api/recipes/{id}",
  tags: ["Recipes"],
  summary: "Get recipe detail",
  request: {
    params: recipeIdParamsSchema
  },
  responses: {
    200: {
      description: "Recipe detail",
      content: {
        "application/json": {
          schema: recipeSchema
        }
      }
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "patch",
  path: "/api/recipes/{id}",
  tags: ["Recipes"],
  summary: "Update recipe",
  request: {
    params: recipeIdParamsSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: updateRecipeRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "Updated recipe",
      content: {
        "application/json": {
          schema: recipeSchema
        }
      }
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "delete",
  path: "/api/recipes/{id}",
  tags: ["Recipes"],
  summary: "Delete recipe",
  request: {
    params: recipeIdParamsSchema
  },
  responses: {
    200: {
      description: "Delete result",
      content: {
        "application/json": {
          schema: deleteRecipeResponseSchema
        }
      }
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: errorResponseSchema
        }
      }
    }
  }
});

export function getOpenApiSpec() {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.3",
    info: {
      title: `${APP_CONFIG.appName} API`,
      version: "0.1.0",
      description: "MVP API for PantryClip recipe capture and management"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development"
      }
    ],
    tags: [{ name: "Health" }, { name: "Recipes" }]
  });
}
