import path from "path";

import { payloadCloud } from "@payloadcms/plugin-cloud";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { webpackBundler } from "@payloadcms/bundler-webpack";
import { slateEditor } from "@payloadcms/richtext-slate";
import { buildConfig } from "payload/config";
import nestedDocs from "@payloadcms/plugin-nested-docs";
import Users from "./collections/Users";

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: slateEditor({}),
  collections: [
    Users,
    {
      slug: "tenants",
      admin: {
        useAsTitle: "title",
      },
      fields: [
        { name: "title", type: "text" },
        { name: "slug", type: "text" },
      ],
    },
    {
      slug: "contacts",
      admin: {
        useAsTitle: "title",
      },
      fields: [
        { name: "title", type: "text" },
        { name: "tenant", type: "relationship", relationTo: "tenants" },
      ],
    },
  ],
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
  },
  plugins: [
    payloadCloud(),
    nestedDocs({
      collections: ["tenants"],
      generateLabel: (_, doc) => doc.title,
      generateURL: (docs) =>
        docs.reduce((url, doc) => `${url}/${doc.slug}`, ""),
    }),
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    /*logger: {
      logQuery: (query: string, params: unknown[]) =>
        console.log(query, params),
    },*/
  }),
});
