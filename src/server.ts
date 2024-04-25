import express from "express";
import payload from "payload";

require("dotenv").config();
const app = express();

// Redirect root to Admin panel
app.get("/", (_, res) => {
  res.redirect("/admin");
});

const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);

      const tenantCount = await payload.count({ collection: "tenants" });
      if (tenantCount.totalDocs === 0) {
        const tenant1 = await payload.create({
          collection: "tenants",
          data: {
            title: "tenant1",
          },
        });

        const tenant2 = await payload.create({
          collection: "tenants",
          data: {
            title: "tenant2",
            parent: tenant1.id,
          },
        });

        await payload.create({
          collection: "contacts",
          data: {
            title: "contact1",
            tenant: tenant1.id,
          },
        });

        await payload.create({
          collection: "contacts",
          data: {
            title: "contact2",
            tenant: tenant2.id,
          },
        });

        payload.logger.info("Created tenants and contacts.");
        payload.logger.info(`Tenant1 created with id: ${tenant1.id}`);
        payload.logger.info(
          `Tenant2 created with id: ${tenant2.id} and parent: ${tenant1.id}`
        );
        payload.logger.info(`Contact1 created with tenant: ${tenant1.id}`);
        payload.logger.info(`Contact2 created with tenant: ${tenant2.id}`);

        payload.logger.error(
          `Based on the above data, the following URL should work and only return contacts that lies in tenant2 hierarchy:`
        );
        payload.logger.error(
          `http://localhost:3000/api/contacts?where[tenant.breadcrumbs.doc][in]=${tenant2.id}`
        );
      }
    },
  });

  // Add your own express routes here

  app.listen(3000);
};

start();
