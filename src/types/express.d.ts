// First, let's create a type definition file for our Express extensions
import { Express } from 'express-serve-static-core';

declare global {
    namespace Express {
        interface Request {
            user?: {
                username: string;
                id: string;
            };
        }
    }
}