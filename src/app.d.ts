import type { WebApp } from '@twa-dev/types';

// src/app.d.ts
declare global {

    namespace App {

        interface Locals {
            user: AuthPayload | null;
        }

    }

    interface Window {
        Telegram: {
            WebApp: WebApp;
        };
    }

}

export {};