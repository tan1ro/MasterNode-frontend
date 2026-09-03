import { Inter, Jersey_10, Jersey_25 } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jersey10 = Jersey_10({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jersey-10",
  display: "swap",
  adjustFontFallback: false,
})

const jersey25 = Jersey_25({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jersey-25",
  display: "swap",
  adjustFontFallback: false,
})

export const HOME_FONT_CLASS = `${inter.variable} ${jersey10.variable} ${jersey25.variable}`
