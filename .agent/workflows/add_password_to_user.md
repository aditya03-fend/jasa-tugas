---
description: Add password field to Prisma User model and regenerate client
---

## Steps to fix the TypeScript error

1. **Update Prisma schema**
   - Open `prisma/schema.prisma`.
   - Locate the `User` model.
   - Add a `password` field. Since some users sign in with Google OAuth and may not have a password, make the field optional:
   ```prisma
   model User {
     id            String   @id @default(uuid())
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt
     name          String?
     image         String?
     role          String
     email         String?  @unique
     emailVerified DateTime?
   ```

- password String? // <-- added field for hashed password
  }

````

2. **Run Prisma migration**
// turbo
```bash
npx prisma migrate dev --name add_password_to_user
````

This will create a new migration that adds the `password` column (nullable) to the `User` table.

3. **Regenerate Prisma client**
   // turbo

   ```bash
   npx prisma generate
   ```

   This updates the generated TypeScript types so that `user.password` is now part of the `User` type.

4. **Update any existing code that creates users**

   - When registering a user with email/password, hash the password (e.g., using `bcryptjs`) and store it in the `password` field.
   - For OAuth‑only users, you can leave `password` as `null`.

5. **Verify the fix**
   - Restart the dev server (`npm run dev`).
   - The TypeScript error `Property 'password' does not exist on type ...` should disappear.
   - Test login with both email/password and Google to ensure authentication works.

## Optional: Add a script to automate steps 2‑3

If you prefer a single command, you can add the following script to `package.json`:

```json
"scripts": {
  "prisma:add-password": "prisma migrate dev --name add_password_to_user && prisma generate"
}
```

Then run `npm run prisma:add-password`.

---

**Note:** After the migration, the database will contain a nullable `password` column. Existing Google‑only users will have `null` in this column, which is safe.
