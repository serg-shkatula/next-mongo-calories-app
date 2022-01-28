import React from 'react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      <Component {...pageProps} />
    </React.Fragment>
  );
}

export default MyApp;
