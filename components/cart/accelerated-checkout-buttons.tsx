"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCart } from "./cart-context";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "shop-pay-button": {
        "store-url": string;
        variants: string;
        children?: React.ReactNode;
      };
      "shopify-accelerated-checkout-cart": {
        "data-shop-id"?: string;
        "data-cart-id"?: string;
        "wallet-configs"?: string;
        children?: React.ReactNode;
      };
    }
  }

  interface Window {
    ShopifyAcceleratedCheckout?: any;
    google?: {
      payments: {
        api: {
          PaymentsClient: new (config: any) => {
            isReadyToPay: (request: any) => Promise<any>;
            loadPaymentData: (request: any) => Promise<any>;
          };
        };
      };
    };
  }

  // Declare google as a global variable
  var google: any;
}

type AcceleratedCheckoutButtonsProps = {
  className?: string;
};

export default function AcceleratedCheckoutButtons({
  className = "",
}: AcceleratedCheckoutButtonsProps) {
  const { cart } = useCart();
  const shopPayRef = useRef<HTMLDivElement>(null);
  const googlePayRef = useRef<HTMLDivElement>(null);
  const [isShopPayLoaded, setIsShopPayLoaded] = useState(false);
  const [showGooglePayButton, setShowGooglePayButton] = useState(false);

  // Extract store domain from cart checkout URL
  const getStoreDomain = () => {
    if (cart?.checkoutUrl) {
      try {
        const url = new URL(cart.checkoutUrl);
        return url.hostname;
      } catch (e) {
        console.warn("Could not parse checkout URL:", cart.checkoutUrl);
      }
    }
    return "your-store.myshopify.com"; // Fallback
  };

  const storeDomain = getStoreDomain();

  useEffect(() => {
    if (!cart || cart.lines.length === 0) return;

    // Load Shop Pay script
    const loadShopPayScript = () => {
      if (document.querySelector('script[src*="shop-js"]')) {
        setIsShopPayLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdn.shopify.com/shopifycloud/shop-js/modules/v2/loader.pay-button.esm.js";
      script.type = "module";
      script.async = true;

      script.onload = () => {
        setIsShopPayLoaded(true);
      };

      script.onerror = () => {
        console.warn("Failed to load Shop Pay script");
      };

      document.head.appendChild(script);
    };

    loadShopPayScript();
  }, [cart]);

  // Initialize Google Pay with proper Web Payments API
  useEffect(() => {
    console.log(
      "Google Pay effect running. Cart:",
      !!cart,
      "Lines:",
      cart?.lines.length || 0
    );

    if (!cart || cart.lines.length === 0) {
      console.log("Google Pay: No cart or empty cart, hiding button");
      setShowGooglePayButton(false);
      return;
    }

    // Load Google Pay API and check availability
    const loadGooglePayAPI = () => {
      // Check if Google Pay script already exists
      if (document.querySelector("script[src*='pay.google.com']")) {
        console.log("Google Pay: API script already loaded");
        checkGooglePayAvailability();
        return;
      }

      console.log("Google Pay: Loading Google Pay API");
      const script = document.createElement("script");
      script.src = "https://pay.google.com/gp/p/js/pay.js";
      script.async = true;

      script.onload = () => {
        console.log("Google Pay API loaded successfully");
        checkGooglePayAvailability();
      };

      script.onerror = () => {
        console.warn("Failed to load Google Pay API - showing fallback button");
        setShowGooglePayButton(true);
      };

      document.head.appendChild(script);
    };

    const checkGooglePayAvailability = () => {
      if (typeof google !== "undefined" && google.payments) {
        console.log("Google Pay: Checking availability");
        try {
          const paymentsClient = new google.payments.api.PaymentsClient({
            environment: "TEST", // Change to 'PRODUCTION' for live stores
          });

          const isReadyToPayRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [
              {
                type: "CARD",
                parameters: {
                  allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                  allowedCardNetworks: [
                    "MASTERCARD",
                    "VISA",
                    "AMEX",
                    "DISCOVER",
                  ],
                },
              },
            ],
          };

          paymentsClient
            .isReadyToPay(isReadyToPayRequest)
            .then((response: any) => {
              console.log("Google Pay availability check:", response);
              setShowGooglePayButton(response.result);
            })
            .catch((err: any) => {
              console.warn("Google Pay not available:", err);
              setShowGooglePayButton(true); // Show fallback
            });
        } catch (error) {
          console.warn("Google Pay initialization failed:", error);
          setShowGooglePayButton(true); // Show fallback
        }
      } else {
        console.log("Google Pay: API not available, showing fallback");
        setShowGooglePayButton(true);
      }
    };

    loadGooglePayAPI();
  }, [cart, storeDomain]);

  // Don't render if no cart or cart is empty
  if (!cart || cart.lines.length === 0) {
    console.log(
      "AcceleratedCheckoutButtons: Not rendering, no cart or empty cart"
    );
    return null;
  }

  console.log(
    "AcceleratedCheckoutButtons rendering. showGooglePayButton:",
    showGooglePayButton
  );

  // Format variants for Shop Pay button
  const formatVariantsForShopPay = () => {
    return cart.lines
      .map((line) => {
        // Extract variant ID from the Shopify GID
        const variantId = line.merchandise.id.split("/").pop();
        return `${variantId}:${line.quantity}`;
      })
      .join(",");
  };

  // Handle Google Pay button click with actual payment processing
  const handleGooglePayClick = () => {
    console.log("Google Pay button clicked");

    if (typeof google !== "undefined" && google.payments) {
      initiateGooglePayPayment();
    } else {
      console.log("Google Pay API not available, redirecting to checkout");
      // Fallback to Shopify checkout
      if (cart?.checkoutUrl) {
        const url = new URL(cart.checkoutUrl);
        url.searchParams.set("payment_method", "google_pay");
        window.location.href = url.toString();
      }
    }
  };

  const initiateGooglePayPayment = () => {
    console.log("Initiating Google Pay payment");

    try {
      const paymentsClient = new google.payments.api.PaymentsClient({
        environment: "TEST", // Change to 'PRODUCTION' for live stores
      });

      // Calculate total amount
      const totalAmount = cart?.cost.totalAmount.amount || "0";
      const currencyCode = cart?.cost.totalAmount.currencyCode || "USD";

      console.log("Payment amount:", totalAmount, currencyCode);

      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: "CARD",
            parameters: {
              allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
              allowedCardNetworks: ["MASTERCARD", "VISA", "AMEX", "DISCOVER"],
            },
            tokenizationSpecification: {
              type: "PAYMENT_GATEWAY",
              parameters: {
                gateway: "shopify",
                gatewayMerchantId: storeDomain.replace(/^https?:\/\//, ""),
              },
            },
          },
        ],
        merchantInfo: {
          merchantId: "BCR2DN4TZDQ3IYPP", // This needs to be your actual Google Pay merchant ID
          merchantName: "Your Store Name", // This should be your actual store name
        },
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: totalAmount,
          currencyCode: currencyCode,
          countryCode: "US", // Update based on your store location
        },
      };

      console.log("Loading payment data...");

      paymentsClient
        .loadPaymentData(paymentDataRequest)
        .then((paymentData: any) => {
          console.log("Google Pay payment data received:", paymentData);

          // TODO: In a full implementation, you would:
          // 1. Send payment data to your backend
          // 2. Process payment through Shopify's API
          // 3. Create the order

          // For now, redirect to checkout as a fallback
          alert(
            "Google Pay payment data received! Redirecting to complete checkout..."
          );
          if (cart?.checkoutUrl) {
            window.location.href = cart.checkoutUrl;
          }
        })
        .catch((err: any) => {
          console.warn("Google Pay payment failed or cancelled:", err);
          if (err.statusCode === "CANCELED") {
            console.log("User cancelled Google Pay");
          } else {
            // Fallback to regular checkout
            if (cart?.checkoutUrl) {
              const url = new URL(cart.checkoutUrl);
              url.searchParams.set("payment_method", "google_pay");
              window.location.href = url.toString();
            }
          }
        });
    } catch (error) {
      console.warn("Google Pay initiation failed:", error);
      // Fallback to regular checkout
      if (cart?.checkoutUrl) {
        const url = new URL(cart.checkoutUrl);
        url.searchParams.set("payment_method", "google_pay");
        window.location.href = url.toString();
      }
    }
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {/* Divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          Express checkout
        </span>
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
      </div>

      {/* Shop Pay Button */}
      <div className="shop-pay-container" ref={shopPayRef}>
        {isShopPayLoaded ? (
          React.createElement("shop-pay-button", {
            "store-url": `https://${storeDomain.replace("https://", "").replace("http://", "")}`,
            variants: formatVariantsForShopPay(),
          })
        ) : (
          <div className="flex items-center justify-center h-11 bg-neutral-100 dark:bg-neutral-800 rounded-md animate-pulse">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Loading Shop Pay...
            </span>
          </div>
        )}
      </div>

      {/* Google Pay Button */}
      <div className="google-pay-container" ref={googlePayRef}>
        {showGooglePayButton && (
          <button
            onClick={handleGooglePayClick}
            className="w-full h-11 bg-black hover:bg-gray-800 transition-colors duration-200 rounded-md flex items-center justify-center text-white font-medium"
            type="button"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 41 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.526 2.635v4.083h2.518c.6 0 1.096-.202 1.488-.605.403-.402.605-.882.605-1.438 0-.544-.202-1.018-.605-1.421-.392-.403-.888-.605-1.488-.605h-2.518v-.014zm0 5.52v4.736h-1.504V1.198h4.022c1.158 0 2.135.378 2.932 1.135.797.756 1.195 1.693 1.195 2.81 0 1.117-.398 2.054-1.195 2.81-.797.757-1.774 1.135-2.932 1.135h-2.518v.067zm11.72-2.365c.55 0 1.033.194 1.451.58.418.387.628.86.628 1.421 0 .56-.21 1.033-.628 1.42-.418.386-.901.58-1.451.58-.55 0-1.033-.194-1.451-.58-.418-.387-.628-.86-.628-1.42 0-.561.21-1.034.628-1.421.418-.386.901-.58 1.451-.58zm0 4.736c.94 0 1.746-.335 2.419-1.004.673-.669 1.01-1.481 1.01-2.436 0-.955-.337-1.767-1.01-2.436-.673-.669-1.479-1.004-2.419-1.004-.94 0-1.746.335-2.419 1.004-.673.669-1.01 1.481-1.01 2.436 0 .955.337 1.767 1.01 2.436.673.669 1.479 1.004 2.419 1.004zm7.905-4.736c.55 0 1.033.194 1.451.58.418.387.628.86.628 1.421 0 .56-.21 1.033-.628 1.42-.418.386-.901.58-1.451.58-.55 0-1.033-.194-1.451-.58-.418-.387-.628-.86-.628-1.42 0-.561.21-1.034.628-1.421.418-.386.901-.58 1.451-.58zm0 4.736c.94 0 1.746-.335 2.419-1.004.673-.669 1.01-1.481 1.01-2.436 0-.955-.337-1.767-1.01-2.436-.673-.669-1.479-1.004-2.419-1.004-.94 0-1.746.335-2.419 1.004-.673.669-1.01 1.481-1.01 2.436 0 .955.337 1.767 1.01 2.436.673.669 1.479 1.004 2.419 1.004z"
                fill="currentColor"
              />
              <path
                d="M37.826 5.982c-.403-.596-.999-.894-1.787-.894-.537 0-1.01.192-1.421.575-.41.383-.616.859-.616 1.427h4.506c-.034-.401-.244-.712-.682-1.108zm.631 2.299h-5.805c.067.537.321.986.762 1.348.441.362.957.543 1.548.543.75 0 1.487-.272 2.10-.816l.749 1.228c-.915.725-1.963 1.087-3.144 1.087-1.158 0-2.129-.335-2.913-1.004-.784-.669-1.176-1.481-1.176-2.436 0-.955.392-1.767 1.176-2.436.784-.669 1.755-1.004 2.913-1.004 1.091 0 2.029.335 2.816 1.004.786.669 1.18 1.481 1.18 2.436v.05z"
                fill="currentColor"
              />
            </svg>
            Google Pay
          </button>
        )}
      </div>

      {/* Or Divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          OR
        </span>
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        shop-pay-button {
          --shop-pay-button-width: 100%;
          --shop-pay-button-height: 44px;
          --shop-pay-button-border-radius: 6px;
          display: block;
          width: 100%;
        }

        .google-pay-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
