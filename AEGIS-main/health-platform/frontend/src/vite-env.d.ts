

interface ImportMetaEnv {
    
    readonly VITE_API_BASE_URL: string;
    readonly VITE_HEALTH_SERVICE_URL: string;
    readonly VITE_ALERT_SERVICE_URL: string;
    readonly VITE_ANALYTICS_SERVICE_URL: string;

    
    readonly VITE_WS_URL: string;

    
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;

    
    readonly VITE_CESIUM_ION_TOKEN: string;

    
    readonly VITE_ENABLE_GOOGLE_AUTH: string;
    readonly VITE_DEMO_MODE: string;
    readonly VITE_APP_ENV: string;

    
    readonly VITE_VERCEL_ANALYTICS_ID: string;
    readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
