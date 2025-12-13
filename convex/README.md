# Welcome to your Convex functions directory!

Write your Convex functions here.
See https://docs.convex.dev/functions for more.

A query function that takes two arguments looks like:

```ts
// convex/myFunctions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQueryFunction = query({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Read the database as many times as you need here.
    // See https://docs.convex.dev/database/reading-data.
    const documents = await ctx.db.query("tablename").collect();

    // Arguments passed from the client are properties of the args object.
    console.log(args.first, args.second);

    // Write arbitrary JavaScript here: filter, aggregate, build derived data,
    // remove non-public properties, or create new objects.
    return documents;
  },
});
```

Using this query function in a React component looks like:

```ts
const data = useQuery(api.myFunctions.myQueryFunction, {
  first: 10,
  second: "hello",
});
```

A mutation function looks like:

```ts
// convex/myFunctions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutationFunction = mutation({
  // Validators for arguments.
  args: {
    first: v.string(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Insert or modify documents in the database here.
    // Mutations can also read from the database like queries.
    // See https://docs.convex.dev/database/writing-data.
    const message = { body: args.first, author: args.second };
    const id = await ctx.db.insert("messages", message);

    // Optionally, return a value from your mutation.
    return await ctx.db.get("messages", id);
  },
});
```

Using this mutation function in a React component looks like:

```ts
const mutation = useMutation(api.myFunctions.myMutationFunction);
function handleButtonPress() {
  // fire and forget, the most common way to use mutations
  mutation({ first: "Hello!", second: "me" });
  // OR
  // use the result once the mutation has completed
  mutation({ first: "Hello!", second: "me" }).then((result) =>
    console.log(result)
  );
}
```

Use the Convex CLI to push your functions to a deployment. See everything
the Convex CLI can do by running `npx convex -h` in your project root
directory. To learn more, launch the docs with `npx convex docs`.

Convex & Next.js Implementation Guidelines

This document serves as the system instruction set for generating code within the slack-clone project structure. It focuses on the correct implementation of Convex Mutations, Queries, and Authentication using the @convex-dev/auth standard.

1. Project Stack Context

Framework: Next.js 14+ (App Router)

Database/Backend: Convex

Authentication: Convex Auth (@convex-dev/auth)

Styling: Tailwind CSS + Shadcn UI

Language: TypeScript

2. Backend: Schema & Authentication Setup

Schema Definition (convex/schema.ts)

Always use authTables from the auth package to ensure the authentication schema is compatible with the library.

import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
...authTables,

// Example Custom Table
workspaces: defineTable({
name: v.string(),
userId: v.id("users"), // Foreign key to auth user
joinCode: v.string(),
}),
});

export default schema;

3. Backend: Mutations & Queries

General Rules

Auth Validation: Always resolve the user ID using getAuthUserId at the start of any protected route.

Graceful Failures: If a user is not authenticated in a Query, generally return [] or null rather than throwing an error, to prevent UI crashes during hydration.

Strict Failures: If a user is not authenticated in a Mutation, throw new Error("Unauthorized").

Implementing a Mutation

File: convex/yourFeature.ts

import { v } from "convex/values";
import { mutation } from "./\_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
args: {
name: v.string(),
},
handler: async (ctx, args) => {
// 1. Auth Check
const userId = await getAuthUserId(ctx);
if (!userId) {
throw new Error("Unauthorized");
}

    // 2. Database Operation
    // Use ctx.db.insert, ctx.db.patch, or ctx.db.delete
    const newId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode: "123456", // Example logic
    });

    // 3. Return the ID or relevant data
    return newId;

},
});

Implementing a Query

File: convex/yourFeature.ts

import { v } from "convex/values";
import { query } from "./\_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
args: {},
handler: async (ctx) => {
const userId = await getAuthUserId(ctx);

    // Return empty state if not logged in
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

},
});

4. Client-Side: Custom Hooks Pattern

Do not use useMutation directly in UI components. Wrap them in custom hooks to standardize error handling, loading states, and types.

The Mutation Hook Pattern

File: src/features/your-feature/api/use-create-thing.ts

import { useMutation } from "convex/react";
import { api } from "../../../../convex/\_generated/api";
import { useCallback, useMemo, useState } from "react";
import { Id } from "../../../../convex/\_generated/dataModel";

type RequestType = { name: string }; // Match args from convex/yourFeature.ts
type ResponseType = Id<"workspaces"> | null; // Match return type

type Options = {
onSuccess?: (data: ResponseType) => void;
onError?: (error: Error) => void;
onSettled?: () => void;
throwError?: boolean;
};

export const useCreateThing = () => {
const [data, setData] = useState<ResponseType>(null);
const [error, setError] = useState<Error | null>(null);
// Custom loading state to handle pre-flight checks if needed
const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

const isPending = useMemo(() => status === "pending", [status]);
const isSuccess = useMemo(() => status === "success", [status]);
const isError = useMemo(() => status === "error", [status]);
const isSettled = useMemo(() => status === "settled", [status]);

const mutation = useMutation(api.yourFeature.create);

const mutate = useCallback(async (values: RequestType, options?: Options) => {
try {
setData(null);
setError(null);
setStatus("pending");

      const response = await mutation(values);

      options?.onSuccess?.(response);
      return response;
    } catch (error) {
      setStatus("error");
      options?.onError?.(error as Error);

      if (options?.throwError) {
        throw error;
      }
    } finally {
      setStatus("settled");
      options?.onSettled?.();
    }

}, [mutation]);

return {
mutate,
data,
error,
isPending,
isSuccess,
isError,
isSettled,
};
};

5. Critical Auth Configuration Files

Ensure these files exist and are configured correctly for the auth flow to work.

convex/auth.ts

import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./\_generated/dataModel";

const CustomPassword = Password<DataModel>({
profile(params) {
return {
email: params.email as string,
name: params.name as string,
};
},
});

export const { auth, signIn, signOut, store } = convexAuth({
providers: [CustomPassword, GitHub, Google],
});

src/features/auth/api/use-current-user.ts

import { useQuery } from "convex/react";
import { api } from "../../../../convex/\_generated/api";

export const useCurrentUser = () => {
const data = useQuery(api.users.current);
const isLoading = data === undefined;

return { data, isLoading };
};

6. Common Errors to Avoid

Missing await: Always await database calls (ctx.db.insert, ctx.db.get).

Wrong ID Type: When accepting an ID as an argument, use v.id("tableName"), not v.string().

Correct: channelId: v.id("channels")

Incorrect: channelId: v.string()

Circular Auth Dependencies: Do not import client-side auth helpers in convex/ directory files. Only use @convex-dev/auth/server.

Query Throws: Avoid throwing errors in query functions unless it's a critical logic failure. Authentication failure in a query should return null so the UI can render a "Sign In" state instead of crashing.
