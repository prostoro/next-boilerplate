// #region Global Imports
import * as React from "react";
import App, { AppContext, AppProps } from "next/app";
import { ThemeProvider } from "styled-components";
// #endregion Global Imports

// #region Local Imports
import { theme } from "@Definitions/Styled";
import { appWithTranslation } from "@Server/i18n";
import { AppWithStore, MobxNextPageContext } from "@Interfaces";

import "@Static/css/main.scss";
import { applySnapshot, getSnapshot, ModelCreationType } from "mobx-state-tree";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { createHttpClient, getDataFromTree } from "mst-gql";
import { NextComponentType } from "next/dist/next-server/lib/utils";
import { RootStore, RootStoreType, StoreContext } from "../../src/models";
// #endregion Local Imports

const isServer: boolean = !process.browser;

let store: ModelCreationType<RootStoreType>;

let accessToken: string | null = null;

const requestAccessToken = async () => {
    if (accessToken) return;
    const res = await fetch(`${process.env.APP_HOST}/api/session`);
    if (res.ok) {
        const json = await res.json();
        accessToken = json.accessToken;
    } else {
        accessToken = "public";
    }
    return accessToken;
};

const createWSClient = (url: string) => {
    return new SubscriptionClient(url, {
        lazy: true,
        reconnect: true,
        // connectionParams: async () => {
        //   const token = await requestAccessToken() // happens on the client
        //   console.log("access token", token);
        //   return {
        //     headers: {
        //       authorization: token ? `Bearer ${token}` : '',
        //     },
        //   }
        // }
    });
};

export function getStore(
    snapshot: RootStoreType | null = null
): ModelCreationType<RootStoreType> {
    if (isServer || !store) {
        store = RootStore.create(undefined, {
            gqlHttpClient: createHttpClient(
                "http://localhost:3000/api/graphql"
            ),
            // gqlWsClient: createWSClient('ws://localhost:8080/v1/graphql'),
            ssr: true,
        });
    }
    if (snapshot) {
        applySnapshot(store, snapshot);
    }
    return store;
}

class WebApp extends App<AppWithStore> {
    store: ModelCreationType<RootStoreType>;

    static async getInitialProps({
        Component,
        ctx,
        router,
    }: AppContext & { Component: NextComponentType<MobxNextPageContext> }) {
        const store = getStore();

        const pageProps = Component.getInitialProps
            ? await Component.getInitialProps({ ...ctx, store })
            : {};

        let storeSnapshot = null;
        if (isServer) {
            const tree = (
                <WebApp
                    {...{ Component, router, pageProps, store, storeSnapshot }}
                />
            );
            await getDataFromTree(tree, store);
            storeSnapshot = getSnapshot<RootStoreType>(store);
        }

        return { pageProps, storeSnapshot };
    }

    constructor(props: AppWithStore & AppProps) {
        super(props);
        this.store = props.store || getStore(props.storeSnapshot);
        Object.assign(global, { store: this.store }); // for debugging
    }

    render() {
        const { Component, pageProps } = this.props;

        return (
            <StoreContext.Provider value={this.store}>
                <ThemeProvider theme={theme}>
                    <Component {...pageProps} />
                </ThemeProvider>
            </StoreContext.Provider>
        );
    }
}

export default appWithTranslation(WebApp);
