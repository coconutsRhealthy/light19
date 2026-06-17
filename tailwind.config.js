/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        // diski "soft modern" palette
        cream:  '#FFF6D9',
        panel:  '#FFFCEF',
        ink:    '#43302E',
        sky:    '#C1DBE8',
        butter: '#FFE7A1',
        link:   '#5B8AA6',
        dot:    '#9DBFD0',
      },
      fontFamily: {
        title: ['Fraunces', 'Georgia', 'serif'],
        body:  ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        label: ['Arimo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.16em',
      },
    },
  },
  plugins: [],
}
