import { AuthRoutes } from "@/modules/auth/auth.route";
import { CategoryRoutes } from "@/modules/categories/categories.route";
import { ProductRoutes } from "@/modules/products/product.route";
import { Profiles } from "@/modules/profiles/jobProfiles.route";
import { UserRoutes } from "@/modules/users/user.route";
import express, { NextFunction, Request, Response } from "express";

const router = express.Router();

interface ModuleRoute {
    path: string;
    route: express.Router;
}

const moduleRoutes: ModuleRoute[] = [
    {
        path: "/users",
        route: UserRoutes,
    },
    {
        path: "/auth",
        route: AuthRoutes,
    },
    {
        path: "/profiles",
        route: Profiles,
    },
    {
        path: "/products",
        route: ProductRoutes,
    },
    {
        path: "/categories",
        route: CategoryRoutes,
    },
];

// Register each route and log it using console
moduleRoutes.forEach((route) => {
    try {
        router.use(route.path, route.route);
        console.log(`Route registered: ${route.path}`);
    } catch (error) {
        console.error(`Error registering route ${route.path}:`, error);
    }
});

// Handle 404 errors if no routes match
router.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `No API route found for ${req.originalUrl}`,
    });
    console.warn(`404 Not Found: ${req.originalUrl}`);
});

// Middleware for logging requests
router.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `Request: ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
        );
    });
    next();
});

export default router;
