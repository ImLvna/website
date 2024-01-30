import ctp from '@catppuccin/tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Comic Code Ligatures', ...defaultTheme.fontFamily.sans]
			}
		}
	},
	safelist: [
		{
			pattern: /bg-.+/
		},
		'mocha',
		'macchiato',
		'frappe',
		'latte'
	],
	plugins: [
		ctp({
			defaultFlavour: 'macchiato',
			prefix: false
		})
	]
};
