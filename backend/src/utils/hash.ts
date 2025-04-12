import bcrypt from 'bcrypt';

export const hashPassword = async (plain: string) => {
    return await bcrypt.hash(plain, 10);
};

export const comparePassword = async (plain: string, hashed: string) => {
    return await bcrypt.compare(plain, hashed);
};
