import { pgEnum, PgEnum } from "drizzle-orm/pg-core"; 

export const userRole = pgEnum('user_role', ['customer', 'technician']);