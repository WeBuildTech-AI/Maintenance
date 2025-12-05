import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// 1. Point this to your NestJS GraphQL Endpoint
// By default, NestJS serves GraphQL at /graphql
const httpLink = new HttpLink({
  uri: "http://localhost:8001/graphql", // ⚠️ CHANGE THIS if your backend port is different
});

// 2. Create the Client
export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only', // Good for dashboards to avoid stale data
    },
  },
});