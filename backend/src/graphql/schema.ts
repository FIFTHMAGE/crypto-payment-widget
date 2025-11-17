/** GraphQL API Layer */
export const typeDefs = `
  type Payment {
    id: ID!
    amount: String!
    address: String!
    status: String!
  }
  type Query {
    payment(id: ID!): Payment
    payments: [Payment!]!
  }
  type Mutation {
    createPayment(amount: String!, address: String!): Payment!
  }
`;

