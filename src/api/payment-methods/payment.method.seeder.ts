import { faker } from "@faker-js/faker";
import { eq, or } from "drizzle-orm";

import db from "../../config/database-config";
import PaymentMethodModel from "./payment.method.model";

const seedPaymentMethods = async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const paymentMethodName = faker.word.noun();
      const paymentMethodCode = faker.color.human();

      // * Mulai sekarang pake select aja biar paham sql
      const existingPaymentMethod = await db
        .select()
        .from(PaymentMethodModel)
        .where((table) =>
          or(
            eq(table.code, paymentMethodCode),
            eq(table.name, paymentMethodName),
          ),
        )
        .limit(1);

      if (existingPaymentMethod.length > 0) {
        console.log(`PaymentMethod named ${paymentMethodName} already exist`);
        continue;
      }

      await db.insert(PaymentMethodModel).values({
        code: paymentMethodCode,
        name: paymentMethodName,
      });
    }

    const paymentMethods = await db.query.PaymentMethodModel.findMany();

    console.log(paymentMethods);
  } catch (error) {
    console.log(error);
  }
};

export default seedPaymentMethods;
