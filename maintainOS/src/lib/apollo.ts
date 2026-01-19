import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const RUNTIME_CONFIG_URL = import.meta.env.VITE_RUNTIME_CONFIG_URL;

async function getBackendUrl(): Promise<string> {
  try {
    const response = await fetch(RUNTIME_CONFIG_URL);
    const config = await response.json();
    return config.socket_url || config.api_url.replace('/api/v1', '');
  } catch (error) {
    console.error('Failed to fetch backend URL from worker:', error);
    // Fallback to env variable if worker fails
    return import.meta.env.VITE_API_SOCKETS;
  }
}

let clientInstance: ApolloClient | null = null;

export async function getApolloClient(): Promise<ApolloClient> {
  if (clientInstance) {
    return clientInstance;
  }

  const backendUrl = await getBackendUrl();
  
  const httpLink = new HttpLink({
    uri: `${backendUrl}/graphql`,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  clientInstance = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
      },
    },
  });

  return clientInstance;
}

// For backwards compatibility, export a synchronous client
// This will use the fallback URL initially
const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_API_SOCKETS}/graphql`,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});