// #region Global Imports
import { AppInitialProps } from "next/app";
import { NextPageContext } from "next";
import { ModelCreationType } from "mobx-state-tree";
import { RootStoreType } from "../../models";
// #endregion Global Imports

export interface AppWithStore extends AppInitialProps {
    store: ModelCreationType<RootStoreType>;
    storeSnapshot: RootStoreType | null;
}

export interface MobxNextPageContext extends NextPageContext {
    store: ModelCreationType<RootStoreType>;
}
