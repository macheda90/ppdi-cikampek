import "dotenv/config"; // Important: Load this first
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "Missing DATABASE_URL. Set it in your environment (or in .env) to a MySQL URL like: mysql://user:pass@host:3306/dbname"
    );
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        url: databaseUrl,
    },
});
