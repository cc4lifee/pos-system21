import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma";

const DEFAULT_ROLE_NAME = "CASHIER";
const SALT_ROUNDS = 10;

const authUserArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { role: true },
});

const publicUserArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    isActive: true,
    createdAt: true,
  },
});

export type AuthUser = Prisma.UserGetPayload<typeof authUserArgs>;
export type PublicUser = Prisma.UserGetPayload<typeof publicUserArgs>;

const resolveRoleId = async (roleId?: string, roleName?: string) => {
  if (roleId) {
    return roleId;
  }

  const name = roleName?.toString().toUpperCase() || DEFAULT_ROLE_NAME;
  const role = await prisma.role.findUnique({ where: { name } });

  if (!role) {
    throw new Error(`Role not found: ${name}`);
  }

  return role.id;
};

export const users = (): Promise<PublicUser[]> => {
  return prisma.user.findMany(publicUserArgs);
};

export const userByEmail = async (email: string): Promise<AuthUser | null> => {
  return prisma.user.findUnique({
    where: { email },
    ...authUserArgs,
  });
};

export const userById = async (userId: string): Promise<PublicUser | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
    ...publicUserArgs,
  });
};

export const authUserById = async (
  userId: string,
): Promise<AuthUser | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
    ...authUserArgs,
  });
};

export const updatePassword = async (userId: string, password: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password },
  });
};

export const createUser = async ({
  email,
  password,
  name,
  roleId,
  role,
}: {
  email: string;
  password: string;
  name: string;
  roleId?: string;
  role?: string;
}) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const resolvedRoleId = await resolveRoleId(roleId, role);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      roleId: resolvedRoleId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
};

export const updateUser = async (
  userId: string,
  {
    name,
    roleId,
    role,
    isActive,
  }: {
    name?: string;
    roleId?: string;
    role?: string;
    isActive?: boolean;
  },
) => {
  const data: Prisma.UserUncheckedUpdateInput = {
    ...(name && { name }),
    ...(isActive !== undefined && { isActive }),
  };

  if (roleId || role) {
    data.roleId = await resolveRoleId(roleId, role);
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
};
