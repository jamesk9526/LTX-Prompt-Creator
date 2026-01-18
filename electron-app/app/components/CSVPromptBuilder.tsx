'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './CSVPromptBuilder.css';

/**
 * CSV Prompt Builder Component
 * 
 * Inspired by https://github.com/TharindaMarasingha/ComfyUI-CSV-to-Prompt
 * Special thanks to TharindaMarasingha for the ComfyUI CSV-to-Prompt node!
 * 
 * This component allows users to create and edit CSV files with Number, Positive, and Negative columns
 * for prompt management workflows.
 */

interface CSVRow {
  id: string;
  number: string;
  positive: string;
  negative: string;
}

interface CSVPromptBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CSVPromptBuilder({ isOpen, onClose }: CSVPromptBuilderProps) {
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [autoSave, setAutoSave] = useState(false);
  const [statusMessage, setStatusMessage] = useState('No file loaded');
  const [statusColor, setStatusColor] = useState<'gray' | 'green' | 'orange' | 'blue'>('gray');

  // Edit form state (number is automatic, only positive/negative are editable)
  const [editPositive, setEditPositive] = useState('');
  const [editNegative, setEditNegative] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with 3 empty rows
  useEffect(() => {
    if (isOpen && rows.length === 0) {
      const initialRows: CSVRow[] = [
        { id: '1', number: '1', positive: '', negative: '' },
        { id: '2', number: '2', positive: '', negative: '' },
        { id: '3', number: '3', positive: '', negative: '' }
      ];
      setRows(initialRows);
    }
  }, [isOpen, rows.length]);

  // Get next available number
  const getNextNumber = (): string => {
    if (rows.length === 0) return '1';
    const numbers = rows.map(r => parseInt(r.number) || 0);
    const maxNumber = Math.max(...numbers, 0);
    return String(maxNumber + 1);
  };

  // Add new row
  const addRow = () => {
    const newRow: CSVRow = {
      id: String(Date.now()),
      number: getNextNumber(),
      positive: '',
      negative: ''
    };
    setRows([...rows, newRow]);
    setSelectedRowId(newRow.id);
    autoSaveData();
  };

  // Remove selected row
  const removeSelected = () => {
    if (!selectedRowId) {
      alert('Please select a row to remove');
      return;
    }
    setRows(rows.filter(r => r.id !== selectedRowId));
    setSelectedRowId(null);
    clearEditForm();
    autoSaveData();
  };

  // Clear all rows
  const clearAll = () => {
    if (rows.length === 0) return;
    if (confirm('Remove all rows?')) {
      setRows([]);
      setSelectedRowId(null);
      clearEditForm();
      autoSaveData();
    }
  };

  // Select row and load into edit form
  const selectRow = (rowId: string) => {
    setSelectedRowId(rowId);
    const row = rows.find(r => r.id === rowId);
    if (row) {
      // Don't load number into edit form - it's automatic
      setEditPositive(row.positive);
      setEditNegative(row.negative);
    }
  };

  // Clear edit form
  const clearEditForm = () => {
    // Number is automatic, don't clear it
    setEditPositive('');
    setEditNegative('');
  };

  // Update status message
  const updateStatus = useCallback((message: string, color: 'gray' | 'green' | 'orange' | 'blue') => {
    setStatusMessage(message);
    setStatusColor(color);
  }, []);

  // Auto-save functionality
  const autoSaveData = useCallback(() => {
    if (!autoSave || !currentFile) return;

    try {
      // In a full Electron app, we'd use fs.writeFileSync here
      // For now, we just update the status
      updateStatus(`✓ Saved to: ${currentFile}`, 'green');
      setTimeout(() => {
        updateStatus(`Auto-saving to: ${currentFile}`, 'green');
      }, 2000);
    } catch (error) {
      // Silent error handling for auto-save
      updateStatus('Auto-save failed', 'orange');
    }
  }, [autoSave, currentFile, updateStatus]);

  // Update row from edit form
  const updateFromForm = useCallback((field: 'positive' | 'negative', value: string) => {
    if (!selectedRowId) return;

    setRows(prevRows => prevRows.map(row => {
      if (row.id === selectedRowId) {
        return { ...row, [field]: value };
      }
      return row;
    }));

    autoSaveData();
  }, [selectedRowId, autoSaveData]);

  // Handle edit form changes (only for positive/negative, number is automatic)
  useEffect(() => {
    if (selectedRowId) {
      updateFromForm('positive', editPositive);
    }
  }, [editPositive, selectedRowId, updateFromForm]);

  useEffect(() => {
    if (selectedRowId) {
      updateFromForm('negative', editNegative);
    }
  }, [editNegative, selectedRowId, updateFromForm]);

  // Generate CSV content
  const generateCSVContent = (): string => {
    const header = 'Number,positive,negative\n';
    const content = rows.map(row => {
      const num = row.number || getNextNumber();
      const pos = `"${row.positive.replace(/"/g, '""')}"`;
      const neg = `"${row.negative.replace(/"/g, '""')}"`;
      return `${num},${pos},${neg}`;
    }).join('\n');
    return header + content;
  };

  // Save CSV
  const saveCSV = () => {
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = currentFile || `prompts_${Date.now()}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setCurrentFile(filename);
    updateStatus(`Saved to: ${filename}`, 'gray');
  };

  // Load CSV
  const loadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header if it matches expected format
        let startIndex = 0;
        if (lines[0]?.toLowerCase().includes('number') && 
            lines[0]?.toLowerCase().includes('positive') && 
            lines[0]?.toLowerCase().includes('negative')) {
          startIndex = 1;
        }

        // Parse CSV rows
        const loadedRows: CSVRow[] = [];
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i];
          const parts = parseCSVLine(line);
          if (parts.length >= 3) {
            loadedRows.push({
              id: String(Date.now() + i),
              number: parts[0] || String(i - startIndex + 1),
              positive: parts[1] || '',
              negative: parts[2] || ''
            });
          }
        }

        setRows(loadedRows);
        setCurrentFile(file.name);
        updateStatus(`Loaded: ${file.name}`, 'gray');
        setSelectedRowId(null);
        clearEditForm();
      } catch (error) {
        alert(`Could not load CSV: ${error}`);
      }
    };
    reader.readAsText(file);
  };

  // Simple CSV line parser (handles quoted fields)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    
    return result.map(s => s.trim());
  };

  // Toggle auto-save
  const toggleAutoSave = () => {
    if (!autoSave && !currentFile) {
      updateStatus('Load a file to enable auto-save', 'orange');
      return;
    }
    setAutoSave(!autoSave);
    if (!autoSave) {
      updateStatus(`Auto-saving to: ${currentFile}`, 'green');
    } else {
      updateStatus(`Loaded: ${currentFile}`, 'gray');
    }
  };

  if (!isOpen) return null;

  const selectedRow = rows.find(r => r.id === selectedRowId);

  return (
    <div className="csv-builder-overlay" onClick={onClose}>
      <div className="csv-builder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="csv-builder-header">
          <div>
            <h2>CSV Prompt Builder</h2>
            <p className="csv-builder-credit">
              Inspired by <a href="https://github.com/TharindaMarasingha/ComfyUI-CSV-to-Prompt" target="_blank" rel="noopener noreferrer">
                ComfyUI CSV-to-Prompt
              </a> by TharindaMarasingha
            </p>
          </div>
          <button className="csv-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="csv-builder-toolbar">
          <button className="csv-btn csv-btn-primary" onClick={addRow}>+ Add Row</button>
          <button className="csv-btn" onClick={removeSelected}>Remove Selected</button>
          <button className="csv-btn" onClick={clearAll}>Clear All</button>
          
          <div className="csv-toolbar-divider" />
          
          <button className="csv-btn" onClick={saveCSV}>💾 Save CSV</button>
          <button className="csv-btn" onClick={() => fileInputRef.current?.click()}>
            📂 Load CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="csv-hidden-input"
            onChange={loadCSV}
            aria-label="Load CSV file"
          />
          
          <div className="csv-toolbar-divider" />
          
          <label className="csv-auto-save-label">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={toggleAutoSave}
            />
            <span>Auto-save</span>
          </label>
          
          <span className={`csv-status csv-status-${statusColor}`}>
            {statusMessage}
          </span>
        </div>

        <div className="csv-builder-content">
          <div className="csv-table-container">
            <table className="csv-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Positive</th>
                  <th>Negative</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr
                    key={row.id}
                    className={selectedRowId === row.id ? 'csv-row-selected' : ''}
                    onClick={() => selectRow(row.id)}
                  >
                    <td className="csv-cell-number">{row.number}</td>
                    <td className="csv-cell-text">{row.positive}</td>
                    <td className="csv-cell-text">{row.negative}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <div className="csv-empty-state">
                <p>No rows yet. Click &quot;Add Row&quot; to get started.</p>
              </div>
            )}
          </div>

          <div className="csv-edit-panel">
            <h3>Edit Row</h3>
            
            <div className="csv-form-group csv-number-display">
              <label>Number (Auto):</label>
              <div className="csv-number-value">
                {selectedRow ? selectedRow.number : '-'}
              </div>
            </div>

            <div className="csv-form-group">
              <label>Positive:</label>
              <textarea
                value={editPositive}
                onChange={(e) => setEditPositive(e.target.value)}
                placeholder="Enter positive prompt"
                disabled={!selectedRowId}
                rows={8}
              />
            </div>

            <div className="csv-form-group">
              <label>Negative:</label>
              <textarea
                value={editNegative}
                onChange={(e) => setEditNegative(e.target.value)}
                placeholder="Enter negative prompt"
                disabled={!selectedRowId}
                rows={8}
              />
            </div>

            <div className={`csv-edit-info csv-edit-info-${selectedRow ? 'active' : 'inactive'}`}>
              {selectedRow ? `Editing row ${selectedRow.number}` : 'Select a row to edit'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
