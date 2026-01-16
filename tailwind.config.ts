import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class", "class"], // next-themes와 호환
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./content/**/*.{md,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: [
					'var(--font-sans)',
					'system-ui',
					'sans-serif'
				],
				mono: [
					'var(--font-mono)',
					'Consolas',
					'monospace'
				]
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: 'none',
						color: 'hsl(var(--foreground))',
						'code::before': {
							content: 'none'
						},
						'code::after': {
							content: 'none'
						},
						code: {
							backgroundColor: 'hsl(var(--muted))',
							padding: '0.25rem 0.375rem',
							borderRadius: '0.25rem',
							fontWeight: '400'
						},
						a: {
							color: 'hsl(var(--primary))',
							textDecoration: 'underline',
							textUnderlineOffset: '2px',
							'&:hover': {
								color: 'hsl(var(--primary) / 0.8)'
							}
						},
						strong: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600'
						},
						b: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600'
						},
						p: {
							color: 'hsl(var(--foreground))'
						},
						li: {
							color: 'hsl(var(--foreground))'
						},
						'li::marker': {
							color: 'hsl(var(--muted-foreground))'
						},
						h1: {
							color: 'hsl(var(--foreground))'
						},
						h2: {
							color: 'hsl(var(--foreground))'
						},
						h3: {
							color: 'hsl(var(--foreground))'
						},
						h4: {
							color: 'hsl(var(--foreground))'
						},
						th: {
							color: 'hsl(var(--foreground))'
						},
						td: {
							color: 'hsl(var(--foreground))'
						},
						thead: {
							borderBottomColor: 'hsl(var(--border))'
						},
						tbody: {
							'tr': {
								borderBottomColor: 'hsl(var(--border))'
							}
						},
						blockquote: {
							color: 'hsl(var(--foreground))',
							borderLeftColor: 'hsl(var(--primary))',
							backgroundColor: 'hsl(var(--muted) / 0.5)',
							padding: '1rem',
							borderRadius: '0 0.5rem 0.5rem 0'
						}
					}
				}
			}
		}
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("tailwindcss-animate")
	],
};

export default config;
