# Accelerated Checkout Setup

This document explains how to configure Shop Pay and Google Pay accelerated checkout buttons in your Shopify headless storefront.

## Overview

The accelerated checkout buttons have been implemented in the cart modal to provide customers with faster checkout options using Shop Pay and Google Pay.

## Features Implemented

### ✅ Shop Pay Button

- **Component**: `AcceleratedCheckoutButtons`
- **Location**: Cart modal
- **Functionality**: Uses Shopify's official Shop Pay Web Component
- **Behavior**: Creates a direct checkout flow for customers with Shop Pay accounts

### ✅ Google Pay Button

- **Component**: `AcceleratedCheckoutButtons`
- **Location**: Cart modal
- **Functionality**: **Real Google Pay Web Payments API integration**
- **Behavior**:
  - **Primary**: Loads Google Pay API and shows native Google Pay payment sheet
  - **Payment Processing**: Uses Google Pay Web Payments API for express checkout
  - **Fallback**: Redirects to Shopify checkout with Google Pay preference if API fails

## Setup Instructions

### 1. Environment Variables

This project uses the standard Shopify environment variables. Make sure you have these set in your `.env.local`:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

**Note**: The accelerated checkout buttons automatically detect the store domain from the cart's checkout URL, so no additional environment variables are needed for the buttons to work.

### 2. Shopify Admin Configuration

#### Enable Shop Pay:

1. Go to **Settings** > **Payments** in your Shopify admin
2. In the **Shopify Payments** section, click **Manage**
3. Under **Wallets**, ensure **Shop Pay** is enabled
4. Save your changes

#### Enable Google Pay:

1. In the same **Shopify Payments** section
2. Under **Wallets**, ensure **Google Pay** is enabled
3. **Important**: You'll need to configure your Google Pay merchant ID
4. **For Testing**: The component uses Google Pay's TEST environment by default
5. **For Production**: Change `environment: "TEST"` to `environment: "PRODUCTION"` in the code
6. Save your changes

#### Google Pay Configuration:

The component includes these important settings you may need to update:

- **Merchant ID**: Currently set to `"BCR2DN4TZDQ3IYPP"` (update with your actual Google Pay merchant ID)
- **Merchant Name**: Currently set to `"Your Store Name"` (update with your store name)
- **Country Code**: Currently set to `"US"` (update based on your store location)
- **Gateway**: Uses `"shopify"` (correct for Shopify stores)

### 3. Testing

#### Shop Pay Testing:

1. Add items to cart in your storefront
2. Open the cart modal
3. You should see a "Shop Pay" button above the regular checkout button
4. The button should load dynamically and work for customers with Shop Pay accounts

#### Google Pay Testing:

1. The Google Pay button appears as a styled button
2. Clicking it redirects to Shopify's checkout where Google Pay options will be available
3. Google Pay availability depends on browser support and Shopify configuration

## Technical Implementation

### Files Modified/Created:

- `components/cart/accelerated-checkout-buttons.tsx` - New component for accelerated checkout buttons
- `components/cart/modal.tsx` - Updated to include the new buttons

### Component Features:

- **Dynamic Loading**: Scripts are loaded asynchronously to avoid blocking the UI
- **Cart Integration**: Automatically formats cart data for Shop Pay button
- **Responsive Design**: Buttons adapt to the cart modal's styling
- **Loading States**: Shows loading indicators while scripts load
- **Error Handling**: Gracefully handles script loading failures

### Browser Compatibility:

- Shop Pay: Supported in all modern browsers
- Google Pay: Requires HTTPS and modern browser support

## Customization

### Styling

The buttons can be customized by modifying the CSS custom properties in the component:

```css
shop-pay-button {
  --shop-pay-button-width: 100%;
  --shop-pay-button-height: 44px;
  --shop-pay-button-border-radius: 6px;
}
```

### Button Visibility

You can control when the buttons appear by modifying the conditional rendering logic in `AcceleratedCheckoutButtons.tsx`.

## Troubleshooting

### Shop Pay Button Not Appearing:

1. Verify `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` is set correctly
2. Check that Shop Pay is enabled in Shopify admin
3. Ensure the cart has items
4. Check browser console for script loading errors

### Google Pay Not Working:

1. **Check Shopify Configuration**: Verify Google Pay is enabled in Shopify Payments settings
2. **HTTPS Required**: Test on HTTPS (required for Google Pay)
3. **Store Domain**: Check that the store domain is properly configured
4. **Native vs Fallback**:
   - The component first tries to load Shopify's native Google Pay integration
   - If that fails, it shows a fallback button that redirects to checkout
   - Check browser console for any loading errors
5. **Browser Support**: Ensure you're testing on a browser that supports Google Pay
6. **Payment Method Preference**: The fallback button adds `?payment_method=google_pay` to the checkout URL

### General Issues:

1. Clear browser cache and cookies
2. Test in incognito/private browsing mode
3. Check network tab for failed script requests
4. Verify cart data is properly formatted

## Next Steps

### Potential Enhancements:

1. **Apple Pay Integration**: Add Apple Pay support for Safari users
2. **PayPal Express**: Integrate PayPal Express checkout
3. **Analytics**: Add tracking for accelerated checkout usage
4. **A/B Testing**: Test different button placements and designs
5. **Mobile Optimization**: Further optimize for mobile checkout flows

### Advanced Configuration:

- Implement Shop Pay email recognition for guest checkout
- Add custom event handlers for checkout completion
- Integrate with analytics platforms for conversion tracking

## Support

For issues related to:

- **Shop Pay**: Contact Shopify Support or check Shopify's Shop Pay documentation
- **Google Pay**: Check Google Pay developer documentation and Shopify Payments setup
- **Implementation**: Review the component code and this documentation
