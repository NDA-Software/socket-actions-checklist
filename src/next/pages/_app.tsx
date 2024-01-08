import type { AppProps } from 'next/app';
import { type ReactElement } from 'react';

import '@fontsource/inter';

export default function App({ Component, pageProps }: AppProps): ReactElement<any, any> {
    return <Component {...pageProps} />;
}
