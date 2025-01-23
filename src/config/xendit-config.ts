import { Invoice as InvoiceClient, Xendit } from "xendit-node";

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY as string,
});
const { Invoice } = xenditClient;

export const xenditInvoiceClient = new InvoiceClient({
  secretKey: process.env.XENDIT_SECRET_KEY as string,
});
