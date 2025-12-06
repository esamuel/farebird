// Diagnostic utility to check environment variables
export const checkEnvVars = () => {
    console.log('🔍 Environment Variables Diagnostic:');
    console.log('=====================================');

    const vars = {
        'VITE_API_KEY': import.meta.env.VITE_API_KEY,
        'VITE_DUFFEL_API_KEY': import.meta.env.VITE_DUFFEL_API_KEY,
        'MODE': import.meta.env.MODE,
        'DEV': import.meta.env.DEV,
        'PROD': import.meta.env.PROD,
    };

    Object.entries(vars).forEach(([key, value]) => {
        if (value) {
            // Show first 10 chars only for security
            const preview = typeof value === 'string'
                ? value.substring(0, 10) + '...'
                : value;
            console.log(`✅ ${key}: ${preview}`);
        } else {
            console.log(`❌ ${key}: NOT SET`);
        }
    });

    console.log('=====================================');

    // Return status
    return {
        geminiConfigured: !!import.meta.env.VITE_API_KEY,
        duffelConfigured: !!import.meta.env.VITE_DUFFEL_API_KEY,
    };
};
