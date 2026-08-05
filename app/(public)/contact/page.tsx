import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with AI Search Arena. Questions about benchmarks, methodology, vendor participation, or partnerships.",
  openGraph: {
    title: "Contact AI Search Arena",
    description:
      "Get in touch with questions about benchmarks, methodology, vendor participation, or partnerships.",
  },
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-arena-slate text-3xl font-bold tracking-tight sm:text-4xl">Contact</h1>

      <p className="mt-4 text-base leading-relaxed text-gray-700">
        Have a question about our benchmarks, methodology, or vendor participation? Send us a
        message and we&apos;ll get back to you.
      </p>

      <div className="mt-8 max-w-lg">
        <ContactForm />
      </div>

      <p className="mt-8 text-sm text-gray-500">
        You can also email us directly at{" "}
        <a
          href="mailto:support@aisearcharena.com"
          className="text-arena-slate underline underline-offset-2"
        >
          support@aisearcharena.com
        </a>
      </p>
    </main>
  );
}
