import daisyui from 'daisyui';
import daisyUIThemes from 'daisyui/src/theming/themes';
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
                    ...daisyUIThemes['black'],
                    primary: 'rgb(29, 155, 240)',
                    secondary: 'rgb(24, 24, 24)'
                }
            }
        ]
    }
};
