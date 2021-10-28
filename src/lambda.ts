import { gql, ApolloServer } from "apollo-server-lambda";

const IS_LOCAL = !!process.env.IS_LOCAL;

const typeDefs = gql`
type Query {
  hello: String
}
`;

const resolvers = {
  Query: {
    hello: () => "Hello, World!",
    'my-tickets': async () => Promise.resolve([{ ticketType: 'ticketType'}])
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: IS_LOCAL,
});

export const handler = server.createHandler();
