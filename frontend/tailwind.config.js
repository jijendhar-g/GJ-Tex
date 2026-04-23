/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                brand: '#ff6b00',
                dark: '#0f172a',
                darkBlue: '#1e293b',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                'orange-glow': 'radial-gradient(circle at center, rgba(255,107,0,0.15) 0%, transparent 70%)',
            },
            boxShadow: {
                'glow': '0 0 60px rgba(255, 107, 0, 0.15)',
                'card': '0 4px 30px rgba(0,0,0,0.05)',
                'card-hover': '0 20px 60px rgba(0,0,0,0.12)',
            }
        },
    },
    plugins: [],
}
