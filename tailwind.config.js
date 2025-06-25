// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Asegúrate de incluir tus archivos React
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        spinBorder: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        spinBorderReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'spin-border': 'spinBorder 6s linear infinite',
        'spin-border-reverse': 'spinBorderReverse 6s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // opcional, mejora estilos de formularios
  ],
}
