import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" 
          rel="stylesheet"
        />
        <style>
          {`
            @font-face {
              font-family: 'Star Jedi';
              src: url('/fonts/Starjedi.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }
          `}
        </style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 