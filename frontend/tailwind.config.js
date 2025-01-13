import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            boxShadow: {
                'right-bottom': '4px 4px 8px rgba(255, 255, 255, 0.2)'
            },
            borderWidth: {
                3: '3px'
            }
        }
    },
    plugins: [daisyui],
    daisyui: {
        themes: [
            'light',
            {
                black: {
                    'color-scheme': 'dark',
                    primary: '#373737',
                    secondary: '#373737',
                    accent: '#373737',
                    'base-100': '#000000',
                    'base-200': '#141414',
                    'base-300': '#262626',
                    'base-content': '#d6d6d6',
                    neutral: '#373737',
                    info: '#0000ff',
                    success: '#008000',
                    warning: '#ffff00',
                    error: '#ff0000',
                    '--rounded-box': '0',
                    '--rounded-btn': '0',
                    '--rounded-badge': '0',
                    '--animation-btn': '0',
                    '--animation-input': '0',
                    '--btn-focus-scale': '1',
                    '--tab-radius': '0'
                }
            }
        ]
    },
    safelist: [
        /^btn/, // Include all button classes
        /^card/, // Include all card classes
        /^text-/, // Include dynamic text classes
        /^bg-/, // Include dynamic background classes
        /^input/, // Include all input classes
        /^select/, // Include all select classes
        /^textarea/ // Include all textarea classes
    ]
};
