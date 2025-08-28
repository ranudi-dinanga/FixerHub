import React from 'react'
import { Text, Button, Reply, Carousel, Element } from '@botonic/react'

export default class extends React.Component {
  render() {
    return (
      <>
        <Text>
          💳 **Billing & Payment Management**

          Manage your payments, invoices, and billing preferences with ease!

          **💰 How Billing Works:**

          **Payment Process:**
          • Secure payment processing through FixerHub
          • Multiple payment methods accepted
          • Pay after service completion
          • Automatic receipt generation
          • Transparent pricing with no hidden fees

          **💳 Accepted Payment Methods:**
          • **Credit/Debit Cards** - Visa, Mastercard, American Express
          • **Digital Wallets** - PayPal, Apple Pay, Google Pay
          • **Bank Transfers** - ACH transfers for larger amounts
          • **FixerHub Credits** - Earned through referrals and reviews
          • **Corporate Accounts** - Business billing options

          **📄 Invoice & Receipt Management:**
          • **Instant Receipts** - Immediate email delivery
          • **Detailed Invoices** - Itemized service breakdown
          • **Digital Storage** - All receipts saved in your account
          • **Tax Documentation** - 1099 forms for business expenses
          • **Export Options** - PDF, CSV for accounting software

          **📊 Billing Dashboard Features:**
          • **Payment History** - Complete transaction log
          • **Spending Analytics** - Monthly/yearly spending charts
          • **Budget Tracking** - Set spending limits and alerts
          • **Category Breakdown** - Expenses by service type
          • **Recurring Payment Setup** - Auto-pay for regular services

          **🔄 Recurring Billing:**
          • Set up automatic payments for regular services
          • Weekly, bi-weekly, or monthly cleaning services
          • Maintenance contracts with preferred providers
          • Family plan billing for shared household accounts

          **💡 Smart Billing Features:**
          • **Budget Alerts** - Notifications when approaching limits
          • **Spending Insights** - AI-powered expense analysis
          • **Cost Comparison** - Compare rates across providers
          • **Seasonal Tracking** - Track seasonal service patterns
          • **Family Sharing** - Split costs among household members

          **🛡️ Payment Security:**
          • PCI DSS compliant payment processing
          • Encrypted transaction data
          • Fraud protection and monitoring
          • Secure tokenization of payment methods
          • Purchase protection policy

          **📞 Billing Support:**
          • Dedicated billing support team
          • Dispute resolution process
          • Refund and chargeback handling
          • Payment plan options for larger services

          **💰 Cost Management Tips:**
          • Bundle services for discounts
          • Book during off-peak hours
          • Set up recurring services for better rates
          • Use FixerHub credits for additional savings
          • Track expenses for tax deductions

          Need help with a payment or want to view your billing history?
        </Text>
        
        <Carousel>
          <Element>
            <Text>📊 **Billing Dashboard**</Text>
            <Button url="http://localhost:5173/billing">View Dashboard</Button>
          </Element>
          <Element>
            <Text>💳 **Payment Methods**</Text>
            <Button url="http://localhost:5173/billing/payment-methods">Manage Cards</Button>
          </Element>
          <Element>
            <Text>📄 **Invoices & Receipts**</Text>
            <Button url="http://localhost:5173/billing/invoices">View History</Button>
          </Element>
          <Element>
            <Text>🔄 **Recurring Payments**</Text>
            <Button url="http://localhost:5173/billing/recurring">Auto-Pay Setup</Button>
          </Element>
        </Carousel>

        <Reply>
          <Button url="http://localhost:5173/billing">💳 Billing Dashboard</Button>
          <Button url="http://localhost:5173/billing/history">📊 Payment History</Button>
          <Button onClick="Pricing">💰 Expense Tracking</Button>
          <Button onClick="Contact">📞 Billing Support</Button>
        </Reply>
      </>
    )
  }
}
