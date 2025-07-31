# Smart Withdrawal Feature Setup Guide

## Overview
The Smart Withdrawal feature allows users to automatically calculate available withdrawals based on their trading profits and reinvestment percentage. It includes:

- **Settings Management**: Users can configure their total capital and reinvestment percentage
- **Available Withdrawals**: Real-time calculation of available funds for withdrawal
- **Transaction History**: Track all withdrawal and revert transactions
- **Revert Functionality**: Ability to undo withdrawals

## Database Setup

### 1. Run the SQL Schema
Execute the `smart_withdrawal_schema.sql` file in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `smart_withdrawal_schema.sql`
4. Run the script

### 2. Verify Tables Created
The script will create:
- `smart_withdrawal_settings` - User configuration
- `withdrawal_transactions` - Transaction history

## Features Implemented

### Dashboard Integration
- **Available Withdrawals Card**: Shows calculated available amount
- **Hover Effect**: Withdraw button appears on hover
- **Transaction History**: Expandable history section
- **Real-time Updates**: Reflects changes immediately

### Settings Page
- **Enable/Disable Toggle**: Turn Smart Withdrawal on/off
- **Total Capital Input**: Set initial trading capital
- **Reinvest Percentage**: Configure profit retention rate
- **Auto-save**: Settings persist to database

### Withdrawal Process
1. **Calculate Available Amount**: Based on profits and reinvest %
2. **Withdrawal Modal**: Enter amount with validation
3. **Transaction Logging**: Record withdrawal in database
4. **History Update**: Show transaction in history
5. **Revert Option**: Undo withdrawals if needed

## Technical Implementation

### API Functions (`src/lib/supabase.ts`)
- `smartWithdrawalAPI.getSettings()` - Fetch user settings
- `smartWithdrawalAPI.saveSettings()` - Save/update settings
- `smartWithdrawalAPI.getTransactions()` - Get transaction history
- `smartWithdrawalAPI.addTransaction()` - Log new transaction
- `smartWithdrawalAPI.revertTransaction()` - Remove transaction

### Components
- `SmartWithdrawal.tsx` - Main component for dashboard
- Updated `Dashboard.tsx` - Integrated withdrawal card
- Updated `Settings.tsx` - Added configuration options

### Security Features
- **Row Level Security (RLS)**: Users can only access their own data
- **Input Validation**: Prevents invalid withdrawal amounts
- **Error Handling**: Graceful error handling with user feedback

## Usage Flow

### 1. Initial Setup
1. Go to Settings page
2. Enable "Smart Withdrawal"
3. Set your total capital
4. Configure reinvest percentage (e.g., 50% = half profits stay in account)
4. Save settings

### 2. Using Withdrawals
1. View "Available Withdrawals" on dashboard
2. Hover over the card to see "Withdraw" button
3. Click to open withdrawal modal
4. Enter amount (cannot exceed available)
5. Confirm withdrawal
6. View transaction in history

### 3. Managing Transactions
1. Click "Show History" on withdrawal card
2. View all transactions with timestamps
3. Click "Revert" on any withdrawal to undo it
4. Available amount updates automatically

## Calculation Logic

```
Available Withdrawals = (Total Profit × (1 - Reinvest %)) - Net Withdrawn

Where:
- Total Profit = Sum of all realized PnL
- Reinvest % = User-configured percentage (e.g., 50%)
- Net Withdrawn = Total Withdrawals - Total Reverts
```

## Error Handling

The implementation includes comprehensive error handling:
- **Database Connection**: Graceful fallback if Supabase unavailable
- **Invalid Inputs**: Validation for withdrawal amounts
- **Network Issues**: Retry logic and user feedback
- **Data Consistency**: Checks for data integrity

## Performance Optimizations

- **Debounced Updates**: Prevents excessive API calls
- **Memoized Calculations**: Efficient profit calculations
- **Lazy Loading**: Transaction history loads on demand
- **Indexed Queries**: Database indexes for fast lookups

## Future Enhancements

Potential improvements:
- **Withdrawal Scheduling**: Set up recurring withdrawals
- **Multiple Accounts**: Support for different trading accounts
- **Advanced Analytics**: Detailed withdrawal analysis
- **Export Features**: Download transaction reports
- **Notifications**: Alerts for large withdrawals

## Troubleshooting

### Common Issues

1. **Settings Not Saving**
   - Check Supabase connection
   - Verify RLS policies are active
   - Check browser console for errors

2. **Available Amount Not Updating**
   - Refresh dashboard
   - Check profit calculations
   - Verify transaction history

3. **Withdrawal Fails**
   - Ensure amount doesn't exceed available
   - Check network connection
   - Verify user authentication

### Debug Steps

1. Open browser developer tools
2. Check Console for error messages
3. Verify Supabase connection in Network tab
4. Test API functions directly in Supabase dashboard

## Security Considerations

- All data is user-scoped with RLS
- Input validation prevents injection attacks
- Sensitive operations require authentication
- Audit trail maintained for all transactions 