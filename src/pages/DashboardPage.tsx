import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Layout } from '../components/Layout';
import { MetricCard } from '../components/MetricCard';
import { Charts } from '../components/Charts';
import { TransactionTable } from '../components/TransactionTable';
import { useTransactionStore } from '../store/transactionStore';

export const DashboardPage: React.FC = () => {
  const { transactions } = useTransactionStore();

  // Calculate metrics
  const totalRevenue = transactions
    .filter(t => t.category === 'Revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.category === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalRevenue - totalExpenses;

  const pendingTransactions = transactions.filter(t => t.status === 'Pending').length;

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            mb: 1
          }}
        >
          Financial Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Overview of your financial performance and transactions
        </Typography>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={TrendingUp}
            color="#10b981"
            trend={{
              value: "12.5%",
              isPositive: true
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Total Expenses"
            value={`₹${totalExpenses.toLocaleString()}`}
            icon={TrendingDown}
            color="#ef4444"
            trend={{
              value: "8.2%",
              isPositive: false
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Net Income"
            value={`₹${netIncome.toLocaleString()}`}
            icon={DollarSign}
            color="#3b82f6"
            trend={{
              value: "15.3%",
              isPositive: netIncome > 0
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Pending Transactions"
            value={pendingTransactions.toString()}
            icon={Activity}
            color="#f59e0b"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Box sx={{ mb: 4 }}>
        <Charts />
      </Box>

      {/* Transaction Table */}
      <TransactionTable />
    </Layout>
  );
};