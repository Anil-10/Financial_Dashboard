import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { Download, X } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

const availableColumns = [
  { key: 'date', label: 'Date' },
  { key: 'amount', label: 'Amount' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'user', label: 'User' },
  { key: 'description', label: 'Description' },
];

export const ExportModal: React.FC<ExportModalProps> = ({ open, onClose }) => {
  const { exportToCsv } = useTransactionStore();
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'date', 'amount', 'category', 'status', 'user', 'description'
  ]);

  const handleColumnToggle = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === availableColumns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(availableColumns.map(col => col.key));
    }
  };

  const handleExport = () => {
    if (selectedColumns.length === 0) return;
    
    exportToCsv(selectedColumns);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid #e2e8f0',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Export Transactions
          </Typography>
          <Button
            onClick={onClose}
            sx={{ minWidth: 'auto', p: 1, color: 'text.secondary' }}
          >
            <X size={20} />
          </Button>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Select the columns you want to include in your CSV export:
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Button
            onClick={handleSelectAll}
            variant="outlined"
            size="small"
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 500,
            }}
          >
            {selectedColumns.length === availableColumns.length ? 'Deselect All' : 'Select All'}
          </Button>
        </Box>
        
        <FormGroup>
          {availableColumns.map((column) => (
            <FormControlLabel
              key={column.key}
              control={
                <Checkbox
                  checked={selectedColumns.includes(column.key)}
                  onChange={() => handleColumnToggle(column.key)}
                  sx={{
                    color: '#3b82f6',
                    '&.Mui-checked': {
                      color: '#3b82f6',
                    },
                  }}
                />
              }
              label={column.label}
              sx={{ 
                py: 0.5,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }
              }}
            />
          ))}
        </FormGroup>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={selectedColumns.length === 0}
          startIcon={<Download size={16} />}
          sx={{
            bgcolor: '#3b82f6',
            '&:hover': { bgcolor: '#2563eb' },
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          Export CSV
        </Button>
      </DialogActions>
    </Dialog>
  );
};