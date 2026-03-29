/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    commissions: {
      getCommissions: FunctionReference<
        "query",
        "internal",
        { affiliateId: string },
        any,
        Name
      >;
      getRecentCommissions: FunctionReference<
        "query",
        "internal",
        { limit?: number },
        any,
        Name
      >;
    };
    management: {
      createAffiliate: FunctionReference<
        "mutation",
        "internal",
        { email: string; userId: string },
        any,
        Name
      >;
      getAdminStats: FunctionReference<"query", "internal", any, any, Name>;
      getAffiliateByCode: FunctionReference<
        "query",
        "internal",
        { code: string },
        any,
        Name
      >;
      getAffiliateByUserId: FunctionReference<
        "query",
        "internal",
        { userId?: string },
        any,
        Name
      >;
      getAllAffiliates: FunctionReference<
        "query",
        "internal",
        { paginationOpts: any },
        any,
        Name
      >;
      updatePayoutSettings: FunctionReference<
        "mutation",
        "internal",
        {
          affiliateId: string;
          autoPayoutEnabled?: boolean;
          payoutAccountNumber?: string;
          payoutBankCountry?: string;
          payoutBankCurrency?: string;
          payoutEmail?: string;
          payoutIban?: string;
          payoutMethod: string;
          payoutName?: string;
          payoutRoutingNumber?: string;
          payoutSwiftCode?: string;
          wiseRecipientId?: string;
        },
        any,
        Name
      >;
    };
    payouts: {
      getPayouts: FunctionReference<
        "query",
        "internal",
        { affiliateId: string },
        any,
        Name
      >;
      requestPayout: FunctionReference<
        "mutation",
        "internal",
        { affiliateId: string; amount: number },
        any,
        Name
      >;
      updatePayoutStatus: FunctionReference<
        "mutation",
        "internal",
        {
          failureReason?: string;
          payoutId: string;
          status: string;
          wiseTransferId?: string;
        },
        any,
        Name
      >;
      updatePayoutStatusByWiseId: FunctionReference<
        "mutation",
        "internal",
        { failureReason?: string; status: string; wiseTransferId: string },
        any,
        Name
      >;
    };
    tracking: {
      createReferral: FunctionReference<
        "mutation",
        "internal",
        { newUserEmail: string; newUserId: string; referralCode: string },
        any,
        Name
      >;
      getReferrals: FunctionReference<
        "query",
        "internal",
        { affiliateId: string },
        any,
        Name
      >;
      trackClick: FunctionReference<
        "mutation",
        "internal",
        {
          country?: string;
          ipAddress?: string;
          referralCode: string;
          userAgent?: string;
        },
        any,
        Name
      >;
    };
    webhook: {
      processOrder: FunctionReference<
        "mutation",
        "internal",
        {
          amount: number;
          email: string;
          orderId: string;
          productId: string;
          productName: string;
          userId?: string;
        },
        any,
        Name
      >;
    };
  };
