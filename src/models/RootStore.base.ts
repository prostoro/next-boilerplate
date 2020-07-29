/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
import { MSTGQLStore, withTypedRefs } from "mst-gql"


/* The TypeScript type that explicits the refs to other models in order to prevent a circular refs issue */
type Refs = {
}


/**
* Store, managing, among others, all the objects received through graphQL
*/
export const RootStoreBase = withTypedRefs<Refs>()(MSTGQLStore
  .named("RootStore"));
