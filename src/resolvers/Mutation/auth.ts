import { Context } from '../../index';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';

interface SignupArgs {
  credentials: { email: string; password: string };
  name: string;
  bio: string;
}
interface SigninArgs {
  credentials: { email: string; password: string };
}

interface UserPayloadType {
  userErrors: { message: string }[];
  token: string | null;
}

export const authResolvers = {
  signup: async (
    _: any,
    { credentials, name, bio }: SignupArgs,
    { prisma }: Context
  ): Promise<UserPayloadType> => {
    const { email, password } = credentials;
    const validEmail = validator.isEmail(email);
    if (!validEmail) {
      return {
        userErrors: [{ message: 'Invalid Email' }],
        token: null,
      };
    }
    const validPassword = validator.isLength(password, {
      min: 5,
    });
    if (!validPassword) {
      return {
        userErrors: [{ message: 'Password contains more than 5 characters' }],
        token: null,
      };
    }

    if (!name || !bio) {
      return {
        userErrors: [{ message: 'Name and bio are required' }],
        token: null,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await prisma.profile.create({
      data: {
        bio,
        userId: user.id,
      },
    });

    const token = JWT.sign(
      { id: user.id },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: 3600000,
      }
    );

    return {
      userErrors: [],
      token,
    };
  },

  signin: async (
    _: any,
    { credentials }: SigninArgs,
    { prisma }: Context
  ): Promise<UserPayloadType> => {
    const { email, password } = credentials;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        userErrors: [{ message: 'Invalid Credentials' }],
        token: null,
      };
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return {
        userErrors: [{ message: 'Invalid Credentials' }],
        token: null,
      };
    }
    const token = JWT.sign(
      { id: user.id },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: 3600000,
      }
    );

    return {
      userErrors: [],
      token,
    };
  },
};
