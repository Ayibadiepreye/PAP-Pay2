import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const peopleTable = pgTable("people", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  name: text("name").notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  ticketCode: text("ticket_code"),
});

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  senderName: text("sender_name").notNull(),
  numberOfPeople: integer("number_of_people").notNull(),
  peopleIds: jsonb("people_ids").notNull().$type<number[]>(),
  paymentProofUrl: text("payment_proof_url").notNull(),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  ticketCode: text("ticket_code").notNull(),
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketCode: text("ticket_code").notNull().unique(),
  paymentId: integer("payment_id").notNull(),
  peopleIds: jsonb("people_ids").notNull().$type<number[]>(),
  isDelivered: boolean("is_delivered").notNull().default(false),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPersonSchema = createInsertSchema(peopleTable).omit({
  id: true,
});
export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  id: true,
  createdAt: true,
});
export const insertTicketSchema = createInsertSchema(ticketsTable).omit({
  id: true,
  createdAt: true,
});

export type Person = typeof peopleTable.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
