/*
  Warnings:

  - Added the required column `slug` to the `recipes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "prepTime" INTEGER NOT NULL,
    "cookTime" INTEGER NOT NULL,
    "totalTime" INTEGER NOT NULL,
    "servings" INTEGER NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "imageCredit" TEXT,
    "unsplashId" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "chefId" TEXT NOT NULL,
    "authorId" TEXT,
    CONSTRAINT "recipes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recipes_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recipes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_recipes" ("authorId", "categoryId", "chefId", "cookTime", "createdAt", "description", "difficulty", "featured", "id", "image", "imageCredit", "prepTime", "rating", "reviewCount", "servings", "title", "totalTime", "unsplashId", "updatedAt") SELECT "authorId", "categoryId", "chefId", "cookTime", "createdAt", "description", "difficulty", "featured", "id", "image", "imageCredit", "prepTime", "rating", "reviewCount", "servings", "title", "totalTime", "unsplashId", "updatedAt" FROM "recipes";
DROP TABLE "recipes";
ALTER TABLE "new_recipes" RENAME TO "recipes";
CREATE UNIQUE INDEX "recipes_slug_key" ON "recipes"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
