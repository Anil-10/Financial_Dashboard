import React, { useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Avatar,
  Typography,
  Paper,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Download, Filter } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { Transaction } from '../types';
import { ExportModal } from './ExportModal';

export const TransactionTable: React.FC = () => {
  const { 
    filteredTransactions, 
    filters, 
    setFilters 
  } = useTransactionStore();
  
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      headerClassName: 'data-grid-header',
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      headerClassName: 'data-grid-header',
      renderCell: (params: GridRenderCellParams<Transaction>) => (
        <Typography variant="body2">
          {new Date(params.row.date).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      headerClassName: 'data-grid-header',
      renderCell: (params: GridRenderCellParams<Transaction>) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            color: params.row.category === 'Revenue' ? '#10b981' : '#ef4444'
          }}
        >
          ₹{params.row.amount.toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      headerClassName: 'data-grid-header',
      renderCell: (params: GridRenderCellParams<Transaction>) => (
        <Chip
          label={params.row.category}
          size="small"
          color={params.row.category === 'Revenue' ? 'success' : 'error'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      headerClassName: 'data-grid-header',
      renderCell: (params: GridRenderCellParams<Transaction>) => (
        <Chip
          label={params.row.status}
          size="small"
          color={params.row.status === 'Paid' ? 'success' : 'warning'}
          variant="filled"
        />
      ),
    },
    {
      field: 'user_id',
      headerName: 'User',
      width: 150,
      headerClassName: 'data-grid-header',
      renderCell: (params: GridRenderCellParams<Transaction>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            src={params.row.user_profile} 
            sx={{ width: 24, height: 24 }}
          />
          <Typography variant="body2">
            {params.row.user_id}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      headerClassName: 'data-grid-header',
      renderCell: (params: GridRenderCellParams<Transaction>) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {params.row.description}
        </Typography>
      ),
    },
  ];

  const uniqueUsers = Array.from(
    new Set(filteredTransactions.map(t => t.user_id))
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Transaction History
            </Typography>
            <Button
              variant="contained"
              startIcon={<Download size={16} />}
              onClick={() => setExportModalOpen(true)}
              sx={{
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Export CSV
            </Button>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                size="small"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                placeholder="Search transactions..."
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => setFilters({ category: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Revenue">Revenue</MenuItem>
                  <MenuItem value="Expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ status: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>User</InputLabel>
                <Select
                  value={filters.user}
                  label="User"
                  onChange={(e) => setFilters({ user: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {uniqueUsers.map(user => (
                    <MenuItem key={user} value={user}>{user}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <DatePicker
                  label="From"
                  value={filters.dateFrom}
                  onChange={(date) => setFilters({ dateFrom: date })}
                  slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
                />
                <DatePicker
                  label="To"
                  value={filters.dateTo}
                  onChange={(date) => setFilters({ dateTo: date })}
                  slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredTransactions}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              border: 'none',
              '& .data-grid-header': {
                backgroundColor: '#f8fafc',
                fontWeight: 600,
                color: '#374151',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f1f5f9',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f8fafc',
              },
            }}
          />
        </Box>
      </Paper>

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </LocalizationProvider>
  );
};