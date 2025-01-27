import { eq, InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  boolean,
  numeric,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import UserModel from "../users/user.model";

const UserAddressModel = pgTable(
  "user_addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => UserModel.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),

    // * Alamat lengkap untuk display
    formattedAddress: text("formatted_address").notNull(),

    // * Komponen terstruktur untuk query
    street: text("street"),
    city: text("city").notNull(),
    province: text("province").notNull(),
    postalCode: text("postal_code"),
    country: text("country").notNull(),

    // * Koordinat geografis (gunakan numeric untuk presisi)
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),

    // * Metadata Geoapify
    geoapifyPlaceId: text("geoapify_place_id"),

    // * Status alamat utama
    isPrimary: boolean("is_primary").notNull().default(false),

    // * Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("unique_primary_address")
      .on(table.userId, table.isPrimary)
      .where(eq(table.isPrimary, true)),

    uniqueIndex("geoapify_place_idx").on(table.geoapifyPlaceId),
  ],
);

export type SelectUserAddressDTO = InferSelectModel<typeof UserAddressModel>;
export type InsertUserAddressDTO = InferInsertModel<typeof UserAddressModel>;

export default UserAddressModel;
