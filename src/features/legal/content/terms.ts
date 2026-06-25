import type { LegalDocument } from "../types";
import { LEGAL_COMPANY, LEGAL_LAST_UPDATED } from "../constants";

const { name, brand, companyNumber, jurisdiction, email } = LEGAL_COMPANY;

export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: [
    `These Terms of Service ("Terms") govern your use of the ${brand} website and app (the "Service"), operated by ${name}, a company registered in England and Wales (company number ${companyNumber}). Please read them carefully.`,
    `By creating an account or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.`,
  ],
  sections: [
    {
      heading: "1. About Treatcode",
      blocks: [
        `${brand} is a "Pay Now Buy Later" service. You make small, regular deposits into your ${brand} account by Direct Debit, and once your balance is sufficient you can redeem it for gift vouchers from our partner retailers. There is no credit, no borrowing and no interest.`,
      ],
    },
    {
      heading: "2. Eligibility",
      blocks: [
        "To use the Service you must be at least 18 years old, be a resident of the United Kingdom, and hold a UK bank account that supports Direct Debit. By using the Service you confirm that you meet these requirements.",
      ],
    },
    {
      heading: "3. Your account",
      blocks: [
        "You are responsible for keeping your account credentials secure and for all activity that takes place under your account. You agree to provide accurate information and to keep it up to date. Please notify us promptly if you suspect any unauthorised use of your account.",
      ],
    },
    {
      heading: "4. How the Service works",
      blocks: [
        {
          list: [
            "You choose a monthly pledge amount and set up a Direct Debit during onboarding.",
            "We collect your first deposit and your recurring monthly deposits via our payment provider, GoCardless.",
            "Each deposit is credited to your Treatcode balance and recorded in your ledger.",
            "When you have enough balance, you can request a gift voucher from a partner retailer, which is delivered to you electronically.",
          ],
        },
      ],
    },
    {
      heading: "5. Nature of the Service — important",
      blocks: [
        `Your ${brand} balance is not a bank account, savings account, deposit or e-money, and it does not earn interest. It is a prepaid balance that can only be used to redeem gift vouchers within the Service. ${name} operates under the limited network exclusion as defined by the Financial Conduct Authority (FCA), and the Service is not a regulated payment or e-money service. Your balance is not protected by the Financial Services Compensation Scheme (FSCS).`,
      ],
    },
    {
      heading: "6. Deposits and Direct Debit",
      blocks: [
        "Deposits are collected by Direct Debit through GoCardless, subject to the Direct Debit Guarantee. By setting up a mandate you authorise these collections. The minimum monthly pledge is £25. You can change your pledge amount, or pause or cancel your Direct Debit, at any time from within the Service. Cancelling your Direct Debit stops future collections but does not by itself close your account or remove your existing balance.",
      ],
    },
    {
      heading: "7. Your Treatcode balance",
      blocks: [
        "Your balance reflects the deposits we have successfully collected, less any redemptions. We maintain a ledger of your activity. If a payment fails, is reversed or is charged back, we will adjust your balance accordingly. We may correct any errors in your balance that arise from technical or processing issues.",
      ],
    },
    {
      heading: "8. Redeeming vouchers",
      blocks: [
        "Vouchers are issued by our partner retailers and are subject to those retailers' own terms and conditions, including expiry dates and usage restrictions. Once a voucher code has been issued to you it is generally non-refundable and non-reversible, except where required by law. We are not responsible for the goods or services you purchase from a retailer using a voucher. Available brands and voucher denominations may change over time.",
      ],
    },
    {
      heading: "9. Cancellation, withdrawals and refunds",
      blocks: [
        `You may stop making deposits at any time by cancelling your Direct Debit. If you wish to close your account, please contact us at ${email}. Where you have a remaining balance that has not been redeemed, we will handle any refund in accordance with your legal rights and our then-current account closure process. Voucher redemptions that have already been fulfilled cannot be refunded except as required by law.`,
      ],
    },
    {
      heading: "10. Acceptable use",
      blocks: [
        "You agree not to misuse the Service, including by using it for any unlawful or fraudulent purpose, attempting to gain unauthorised access to our systems, interfering with the Service's operation, or using it in any way that could damage or impair it. We may suspend or terminate your access if we reasonably believe you have breached these Terms.",
      ],
    },
    {
      heading: "11. Intellectual property",
      blocks: [
        `All content, branding, logos and software that make up the Service are owned by ${name} or our licensors and are protected by intellectual property laws. You may use the Service only as permitted by these Terms and may not copy, modify or distribute any part of it without our permission.`,
      ],
    },
    {
      heading: "12. Limitation of liability",
      blocks: [
        "The Service is provided on an \"as is\" and \"as available\" basis. To the fullest extent permitted by law, we exclude all warranties not expressly set out in these Terms and we are not liable for any indirect or consequential loss. Nothing in these Terms limits or excludes our liability where it would be unlawful to do so, including liability for death or personal injury caused by negligence or for fraud.",
      ],
    },
    {
      heading: "13. Changes to the Service and these Terms",
      blocks: [
        "We may update the Service and these Terms from time to time. When we make material changes to these Terms, we will update the date at the top of this page and, where appropriate, notify you. Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms.",
      ],
    },
    {
      heading: "14. Termination",
      blocks: [
        "You may stop using the Service at any time. We may suspend or terminate your access if you breach these Terms, if required by law, or if we discontinue the Service. On termination, the relevant provisions of these Terms that are intended to survive will continue to apply.",
      ],
    },
    {
      heading: "15. Governing law",
      blocks: [
        `These Terms are governed by the laws of ${jurisdiction}, and any disputes will be subject to the exclusive jurisdiction of the courts of ${jurisdiction}.`,
      ],
    },
    {
      heading: "16. Contact us",
      blocks: [
        `If you have any questions about these Terms, please contact us at ${email}.`,
      ],
    },
  ],
};
