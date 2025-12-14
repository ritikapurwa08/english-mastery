Convex & Next.js Implementation Guidelines

This document serves as the system instruction set for generating code within the project structure. It focuses on the correct implementation of Convex Mutations, Queries, Authentication (@convex-dev/auth), and UI patterns.

1. Project Stack Context

Framework: Next.js 14+ (App Router)

Database/Backend: Convex

Authentication: Convex Auth (@convex-dev/auth)

Styling: Tailwind CSS + Shadcn UI

Language: TypeScript

Forms: React Hook Form + Zod + Shadcn UI (Custom Wrapper Pattern)

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
import { mutation } from "./_generated/server";
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
    const newId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode: "123456",
    });

    return newId;
  },
});


Implementing a Query

File: convex/yourFeature.ts

import { v } from "convex/values";
import { query } from "./_generated/server";
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
import { api } from "../../../../convex/_generated/api";
import { useCallback, useMemo, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = { name: string };
type ResponseType = Id<"workspaces"> | null;

type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useCreateThing = () => {
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);
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
      if (options?.throwError) throw error;
    } finally {
      setStatus("settled");
      options?.onSettled?.();
    }
  }, [mutation]);

  return { mutate, data, error, isPending, isSuccess, isError, isSettled };
};


5. Critical Auth Configuration Files

convex/auth.ts

import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

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


6. Frontend: Advanced Form Handling

Implement the CustomFormField Pattern to reduce boilerplate code. This abstracts the repetitive Shadcn UI structure into a reusable component.

1. The Reusable Component (components/CustomFormField.tsx)

import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
}

interface CustomProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
  fieldType: FormFieldType;
}

const RenderInput = ({ field, props }: { field: any; props: CustomProps }) => {
  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          {props.iconSrc && (
            <img src={props.iconSrc} height={24} width={24} alt={props.iconAlt || "icon"} className="ml-2" />
          )}
          <FormControl>
            <Input placeholder={props.placeholder} {...field} className="shad-input border-0" />
          </FormControl>
        </div>
      );
    case FormFieldType.TEXTAREA:
       // ... implement textarea
       return null;
    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : null;
    default:
      return null;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, name, label } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className="shad-input-label">{label}</FormLabel>
          )}
          <RenderInput field={field} props={props} />
          <FormMessage className="shad-error" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;


2. Implementation in a Form

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField, { FormFieldType } from "@/components/CustomFormField";

const formSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
});

const PatientForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="header">Hi there 👋</h1>
          <p className="text-dark-700">Get started with appointments.</p>
        </section>

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="username"
          label="Full name"
          placeholder="John Doe"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="Email"
          placeholder="johndoe@gmail.com"
          iconSrc="/assets/icons/email.svg"
          iconAlt="email"
        />

        <Button isLoading={isLoading}>Submit</Button>
      </form>
    </Form>
  );
};


7. File Upload Pattern (Convex Storage)

Use a dedicated FileUploader component for drag-and-drop functionality, integrated with Shadcn/React Hook Form.

1. File Uploader Component (components/FileUploader.tsx)

Use react-dropzone for handling files.

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { convertFileToUrl } from '@/lib/utils'

type FileUploaderProps = {
  files: File[] | undefined
  onChange: (files: File[]) => void
}

export const FileUploader = ({ files, onChange }: FileUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div {...getRootProps()} className="file-upload">
      <input {...getInputProps()} />
      {files && files.length > 0 ? (
        <Image src={convertFileToUrl(files[0])} width={1000} height={1000} alt="uploaded image" className="max-h-100 overflow-hidden object-cover" />
      ) : (
        <>
          <Image src="/assets/icons/upload.svg" width={40} height={40} alt="upload" />
          <div className="file-upload_label">
            <p className="text-14-regular ">
              <span className="text-green-500">Click to upload </span>
              or drag and drop
            </p>
            <p className="text-12-regular">SVG, PNG, JPG or GIF (max 800x400)</p>
          </div>
        </>
      )}
    </div>
  )
}


2. Form Integration

Use the CustomFormField with a SKELETON type to render the FileUploader inside the form control.

<CustomFormField
  fieldType={FormFieldType.SKELETON}
  control={form.control}
  name="identificationDocument"
  label="Scanned Copy of Identification Document"
  renderSkeleton={(field) => (
    <FormControl>
      <FileUploader files={field.value} onChange={field.onChange} />
    </FormControl>
  )}
/>


8. Common Errors to Avoid

Missing await: Always await database calls (ctx.db.insert, ctx.db.get).

Wrong ID Type: When accepting an ID as an argument, use v.id("tableName"), not v.string().

Circular Auth Dependencies: Do not import client-side auth helpers in convex/ directory files. Only use @convex-dev/auth/server.

Query Throws: Avoid throwing errors in query functions unless it's a critical logic failure.

Form Reset: Always reset form state (form.reset()) or redirect after a successful mutation to prevent duplicate submissions.

File Objects in Server Actions: You cannot pass raw File objects directly to Server Actions or Convex Mutations. You must upload them first (e.g., to Convex Storage or Appwrite Storage), get a storageId or URL, and pass that to the mutation.
