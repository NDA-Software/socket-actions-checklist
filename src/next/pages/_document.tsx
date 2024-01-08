import { Html, Head, Main, NextScript } from 'next/document';
import { type ReactElement } from 'react';

export default function Document(): ReactElement<any, any> {
    return (
        <Html lang="en">
            <Head />
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
