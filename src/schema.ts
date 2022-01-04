import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    me: User
    posts: [Post!]
  }
  type Mutation {
    createPost(post: PostInput!): PostPayload!
    updatePost(postId: ID!, post: PostInput): PostPayload!
    deletePost(postId: ID!): PostPayload!
    publishPost(postId: ID!): PostPayload!
    unPublishPost(postId: ID!): PostPayload!
    signup(
      name: String!
      credentials: CredentialsInput!
      bio: String!
    ): UserPayload!
    signin(credentials: CredentialsInput!): UserPayload!
  }
  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    createdAt: String!
    user: User!
  }
  type User {
    id: ID!
    email: String!
    profile: Profile!
    posts: [Post!]
  }
  type Profile {
    id: ID!
    bio: String!
    user: User!
  }
  type UserError {
    message: String!
  }
  type PostPayload {
    userErrors: [UserError!]!
    post: Post
  }
  type UserPayload {
    userErrors: [UserError!]!
    token: String
  }

  input PostInput {
    title: String
    content: String
  }
  input CredentialsInput {
    email: String!
    password: String!
  }
`;
