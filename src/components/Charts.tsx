import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Paper, Typography, Box, Grid } from '@mui/material';
import { useTransactionStore } from '../store/transactionStore';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const Charts: React.FC = () => {
  const { transactions } = useTransactionStore();

  // Prepare data for Revenue vs Expenses over time
  const monthlyData = React.useMemo(() => {
    const months = eachMonthOfInterval({
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31),
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = parseISO(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const revenue = monthTransactions
        .filter(t => t.category === 'Revenue')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.category === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'MMM'),
        Revenue: revenue,
        Expenses: expenses,
        Net: revenue - expenses,
      };
    });
  }, [transactions]);

  // Prepare data for category breakdown
  const categoryData = React.useMemo(() => {
    const revenueByCategory = new Map<string, number>();
    const expensesByCategory = new Map<string, number>();

    transactions.forEach(t => {
      if (t.category === 'Revenue') {
        revenueByCategory.set('Revenue', (revenueByCategory.get('Revenue') || 0) + t.amount);
      } else {
        expensesByCategory.set('Expenses', (expensesByCategory.get('Expenses') || 0) + t.amount);
      }
    });

    return [
      { name: 'Revenue', value: revenueByCategory.get('Revenue') || 0 },
      { name: 'Expenses', value: expensesByCategory.get('Expenses') || 0 },
    ];
  }, [transactions]);

  return (
    <Grid container spacing={3}>
      {/* Revenue vs Expenses Line Chart */}
      <Grid item xs={12} lg={8}>
        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', height: 400 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Revenue vs Expenses Over Time
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Revenue"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="Expenses"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Category Pie Chart */}
      <Grid item xs={12} lg={4}>
        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', height: 400 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Revenue vs Expenses Breakdown
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Revenue' ? '#10b981' : '#ef4444'} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Monthly Bar Chart */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', height: 400 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Monthly Financial Overview
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
              />
              <Legend />
              <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};