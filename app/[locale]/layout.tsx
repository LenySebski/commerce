import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { WelcomeToast } from "components/welcome-toast";
import { GeistSans } from "geist/font/sans";
import { routing } from "i18n/routing";
import { getCart } from "lib/shopify";
import { baseUrl } from "lib/utils";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "../globals.css";

const { SITE_NAME } = process.env;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: SITE_NAME!,
      template: `%s | ${SITE_NAME}`,
    },
    robots: {
      follow: true,
      index: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  console.log("locale", locale);
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  console.log("routing.locales", routing.locales);
  console.log("locale", locale);
  console.log(
    "routing.locales.includes(locale as any)",
    routing.locales.includes(locale as any)
  );
  console.dir(getMessages);

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages({ locale });

  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();

  return (
    <html lang={locale} className={GeistSans.variable}>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <NextIntlClientProvider messages={messages}>
          <CartProvider cartPromise={cart}>
            <Navbar />
            <main>
              {children}
              <Toaster closeButton />
              <WelcomeToast />
            </main>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
