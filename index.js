require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SWAGGER DOCUMENTATION
========================= */

const swaggerDocument = {
  openapi: "3.0.0",

  info: {
    title: "TalentBoard API",
    version: "1.0.0",
    description: "TalentBoard Backend API Documentation",
  },

  servers: [
    {
      url:
        process.env.NODE_ENV === "production"
          ? "https://talentboard-x-api-with-mongo-db.onrender.com"
          : `http://localhost:${process.env.PORT || 3004}`,
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },

  security: [
    {
      bearerAuth: [],
    },
  ],

  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register User",

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                required: ["name", "email", "password", "confirmPassword"],

                properties: {
                  name: {
                    type: "string",
                    example: "Nakul Kumar",
                  },

                  email: {
                    type: "string",
                    example: "nakulkumar7319@gmail.com",
                  },

                  password: {
                    type: "string",
                    example: "123456789",
                  },

                  confirmPassword: {
                    type: "string",
                    example: "123456789",
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "User Registered Successfully",
          },

          400: {
            description: "Validation Error",
          },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login User",

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                required: ["email", "password"],

                properties: {
                  email: {
                    type: "string",
                    example: "nakulkumar7319@gmail.com",
                  },

                  password: {
                    type: "string",
                    example: "123456789",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Login Successful",
          },

          401: {
            description: "Invalid Credentials",
          },
        },
      },
    },

    "/api/jobs": {
      get: {
        tags: ["Jobs"],
        summary: "Get All Jobs",

        responses: {
          200: {
            description: "Jobs Fetched Successfully",
          },
        },
      },
    },

    "/api/jobs/create": {
      post: {
        tags: ["Jobs"],
        summary: "Create Job",

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                required: ["title", "profile", "company"],

                properties: {
                  title: {
                    type: "string",
                    example: "Frontend Developer",
                  },

                  profile: {
                    type: "string",
                    example: "React Developer",
                  },

                  company: {
                    type: "string",
                    example: "Google",
                  },

                  location: {
                    type: "string",
                    example: "Remote",
                  },

                  salary: {
                    type: "string",
                    example: "12 LPA",
                  },

                  type: {
                    type: "string",
                    example: "Full Time",
                  },

                  skillsRequired: {
                    type: "array",

                    items: {
                      type: "string",
                    },

                    example: ["React", "JavaScript"],
                  },

                  experienceRequired: {
                    type: "string",
                    example: "2 Years",
                  },

                  description: {
                    type: "string",
                    example: "Job Description",
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "Job Created Successfully",
          },

          400: {
            description: "Validation Error",
          },
        },
      },
    },

    "/api/applications/apply": {
      post: {
        tags: ["Applications"],
        summary: "Apply Job",

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                required: ["jobId", "fullName", "email", "phone"],

                properties: {
                  jobId: {
                    type: "string",
                    example: "665abc123",
                  },

                  fullName: {
                    type: "string",
                    example: "Nakul Kumar",
                  },

                  email: {
                    type: "string",
                    example: "nakulkumar7319@gmail.com",
                  },

                  phone: {
                    type: "string",
                    example: "9876543210",
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "Application Submitted",
          },
        },
      },
    },

    "/api/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Dashboard Statistics",

        responses: {
          200: {
            description: "Dashboard Data",
          },
        },
      },
    },

    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health Check",

        responses: {
          200: {
            description: "Server Running",
          },
        },
      },
    },
  },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/swagger.json", (req, res) => {
  res.json(swaggerDocument);
});

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/applications", applicationRoutes);

app.use("/api/dashboard", dashboardRoutes);

/* =========================
   HEALTH ROUTE
========================= */

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server Running Successfully",
  });
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* =========================
   DATABASE CONNECTION
========================= */

const PORT = process.env.PORT || 3004;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server Running On Port ${PORT}`);

      console.log(`Swagger URL: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Error", error);
  });
