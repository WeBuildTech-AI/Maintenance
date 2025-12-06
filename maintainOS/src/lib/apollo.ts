import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const GRAPHQL_URI = import.meta.env.VITE_API_SOCKETS;

const httpLink = new HttpLink({
  uri: `${GRAPHQL_URI}/graphql`, 
});

// Create the Client
export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only', 
    },
  },
});