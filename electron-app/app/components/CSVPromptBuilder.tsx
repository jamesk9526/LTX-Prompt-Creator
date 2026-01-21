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
  const hasInitializedRef = useRef(false);

  // Load default CSV on component mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      const savedPath = localStorage.getItem('csv_default_file_path');
      console.log('CSV Builder mounted, loading default from:', savedPath);
      
      if (savedPath) {
        const savedData = localStorage.getItem(`csv_data_${savedPath}`);
        if (savedData) {
          try {
            const csvLines = parseCSVData(savedData);
            const dataLines = csvLines.slice(1); // Skip header
            
            const loadedRows: CSVRow[] = [];
            for (let i = 0; i < dataLines.length; i++) {
              const line = dataLines[i];
              const parts = parseCSVLine(line);
              if (parts.length >= 3) {
                loadedRows.push({
                  id: String(Date.now() + i),
                  number: parts[0] || String(i + 1),
                  positive: parts[1] || '',
                  negative: parts[2] || ''
                });
              }
            }
            
            if (loadedRows.length > 0) {
              setRows(loadedRows);
              setCurrentFile(savedPath);
              setAutoSave(true);
              console.log('Default CSV loaded on mount:', loadedRows.length, 'rows');
            }
          } catch (error) {
            console.error('Failed to load default CSV on mount:', error);
          }
        }
      }
    }
  }, []);

  // Simple CSV line parser (handles quoted fields)
  const parseCSVLine = (line: string): string[] => {
    if (!line || !line.trim()) return [];
    
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote ""
          current += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator (comma outside of quotes)
        result.push(current);
        current = '';
      } else if (char === '\\' && line[i + 1] === 'n') {
        // Handle escaped newline from CSV parsing
        current += '\n';
        i++;
      } else {
        current += char;
      }
    }
    // Don't forget the last field
    result.push(current);
    
    // Trim whitespace and remove surrounding quotes if present
    return result.map(s => {
      s = s.trim();
      // Remove surrounding quotes if they wrap the entire field
      if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1);
      }
      return s;
    });
  };

  // Parse CSV data properly, handling multi-line quoted fields
  const parseCSVData = (text: string): string[] => {
    const lines: string[] = [];
    let currentLine = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char === '"') {
        currentLine += char;
        // Check for escaped quote ""
        if (text[i + 1] === '"') {
          currentLine += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === '\n') {
        if (inQuotes) {
          // Newline inside quotes - include it in the current line
          currentLine += '\\n'; // Mark it as a newline character
        } else {
          // Newline outside quotes - end of line
          if (currentLine.trim()) {
            lines.push(currentLine);
          }
          currentLine = '';
        }
      } else {
        currentLine += char;
      }
    }
    
    // Don't forget the last line
    if (currentLine.trim()) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  // Initialize with 3 empty rows and load default file path
  useEffect(() => {
    if (isOpen) {
      // Debug: log all localStorage keys
      console.log('LocalStorage keys:', Object.keys(localStorage));
      
      // Load default file path from localStorage
      const savedPath = localStorage.getItem('csv_default_file_path');
      console.log('CSV Builder opened, saved path:', savedPath);
      if (savedPath) {
        // Try to load saved data from localStorage
        const savedData = localStorage.getItem(`csv_data_${savedPath}`);
        console.log('Saved data from localStorage:', savedData ? 'Found' : 'Not found');
        console.log('Saved data preview (first 200 chars):', savedData?.substring(0, 200));
        if (savedData) {
          // Parse and load the saved CSV data
          try {
            const lines = savedData.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim());
            console.log('Parsed lines:', lines.length);
            let startIndex = 0;
            if (lines[0]?.toLowerCase().includes('number') && 
                lines[0]?.toLowerCase().includes('positive') && 
                lines[0]?.toLowerCase().includes('negative')) {
              startIndex = 1;
            }

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
            
            if (loadedRows.length > 0) {
              setRows(loadedRows);
              setCurrentFile(savedPath);
              setAutoSave(true);
              return;
            }
          } catch (error) {
            console.error('Failed to load saved CSV data:', error);
          }
        }
        
        // If no saved data, just set the file path
        setCurrentFile(savedPath);
        setAutoSave(true);
      }
      
      // Initialize with 3 empty rows if no saved data was loaded
      if (rows.length === 0) {
        const initialRows: CSVRow[] = [
          { id: '1', number: '1', positive: '', negative: '' },
          { id: '2', number: '2', positive: '', negative: '' },
          { id: '3', number: '3', positive: '', negative: '' }
        ];
        setRows(initialRows);
      }
    }
  }, [isOpen]);

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
  
  // Update status when auto-save is enabled
  useEffect(() => {
    if (autoSave && currentFile) {
      updateStatus(`Auto-saving to: ${currentFile}`, 'green');
    }
  }, [autoSave, currentFile, updateStatus]);

  // Generate CSV content
  const generateCSVContent = useCallback((): string => {
    const header = 'Number,positive,negative\n';
    const numbers = rows.map(r => parseInt(r.number) || 0);
    const maxNumber = Math.max(...numbers, 0);
    
    const content = rows.map((row, index) => {
      const num = row.number || String(maxNumber + index + 1);
      const pos = `"${row.positive.replace(/"/g, '""')}"`;
      const neg = `"${row.negative.replace(/"/g, '""')}"`;
      return `${num},${pos},${neg}`;
    }).join('\n');
    return header + content;
  }, [rows]);

  // Auto-save functionality
  const autoSaveData = useCallback(() => {
    if (!autoSave || !currentFile) return;

    try {
      const csvContent = generateCSVContent();
      // Store CSV content in localStorage for browser-based auto-save
      localStorage.setItem(`csv_data_${currentFile}`, csvContent);
      localStorage.setItem('csv_last_save_time', Date.now().toString());
      
      // Also save to file if running in Electron
      if (typeof window !== 'undefined' && (window as any).electron?.fileSystem?.saveCSVFile) {
        // Try to get the full file path from localStorage
        const fullFilePath = localStorage.getItem(`csv_file_path_${currentFile}`);
        const filePathToSave = fullFilePath || currentFile;
        
        (window as any).electron.fileSystem.saveCSVFile(filePathToSave, csvContent).catch((err: any) => {
          console.error('Failed to save CSV file to disk:', err);
        });
      }
      
      updateStatus(`✓ Saved to: ${currentFile}`, 'green');
      setTimeout(() => {
        updateStatus(`Auto-saving to: ${currentFile}`, 'green');
      }, 2000);
    } catch (error) {
      // Silent error handling for auto-save
      updateStatus('Auto-save failed', 'orange');
    }
  }, [autoSave, currentFile, generateCSVContent, updateStatus]);

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

  // Handle edit form changes - these are triggered by onChange handlers on the form inputs
  // NOT by useEffect to avoid infinite loops from state updates
  
  // Add a new row with data (for external use like chat-to-CSV)
  const addRowWithData = useCallback((positiveText: string) => {
    setRows(prevRows => {
      const numbers = prevRows.map(r => parseInt(r.number) || 0);
      const maxNumber = Math.max(...numbers, 0);
      const nextNumber = String(maxNumber + 1);
      
      const newRow: CSVRow = {
        id: String(Date.now()),
        number: nextNumber,
        positive: positiveText,
        negative: '' // Keep negative blank as per requirement
      };
      
      const updatedRows = [...prevRows, newRow];
      
      // Trigger auto-save immediately with updated rows
      if (autoSave && currentFile) {
        const header = 'Number,positive,negative\n';
        const content = updatedRows.map(row => {
          const num = row.number;
          const pos = `"${row.positive.replace(/"/g, '""')}"`;
          const neg = `"${row.negative.replace(/"/g, '""')}"`;
          return `${num},${pos},${neg}`;
        }).join('\n');
        const csvContent = header + content;
        
        localStorage.setItem(`csv_data_${currentFile}`, csvContent);
        localStorage.setItem('csv_last_save_time', Date.now().toString());
      }
      
      return updatedRows;
    });
  }, [autoSave, currentFile]);
  
  // Expose addRowWithData for external use
  useEffect(() => {
    if (isOpen) {
      // Store the function reference globally for ChatPanel to use
      (window as any).csvBuilderAddRow = addRowWithData;
    }
  }, [isOpen, addRowWithData]);

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
    
    // Save to localStorage as well
    localStorage.setItem(`csv_data_${filename}`, csvContent);
    
    updateStatus(`Saved to: ${filename}`, 'gray');
  };
  
  // Set as default file
  const setAsDefaultFile = () => {
    if (!currentFile) {
      updateStatus('Load or save a file first', 'orange');
      return;
    }
    
    localStorage.setItem('csv_default_file_path', currentFile);
    setAutoSave(true);
    updateStatus(`Set as default: ${currentFile}`, 'blue');
    setTimeout(() => {
      updateStatus(`Auto-saving to: ${currentFile}`, 'green');
    }, 2000);
  };

  // Load CSV
  const loadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Normalize line endings
        const normalizedText = text.replace(/\r\n/g, '\n');
        
        console.log('File loaded:', file.name);
        console.log('Total text length:', normalizedText.length);
        
        // Parse CSV properly, handling multi-line quoted fields
        const csvLines = parseCSVData(normalizedText);
        console.log('Parsed CSV lines:', csvLines.length);
        csvLines.slice(0, 3).forEach((line, i) => console.log(`CSV Line ${i}:`, line));
        
        // Skip header
        const dataLines = csvLines.slice(1);
        
        // Parse CSV rows
        const loadedRows: CSVRow[] = [];
        for (let i = 0; i < dataLines.length; i++) {
          const line = dataLines[i];
          const parts = parseCSVLine(line);
          console.log(`Row ${i}: parts.length=${parts.length}`, 'first 100 chars:', line.substring(0, 100));
          if (parts.length >= 3) {
            loadedRows.push({
              id: String(Date.now() + i),
              number: parts[0] || String(i + 1),
              positive: parts[1] || '',
              negative: parts[2] || ''
            });
          }
        }

        // Generate CSV content from loaded rows
        const header = 'Number,positive,negative\n';
        const csvContent = header + loadedRows.map(row => {
          const pos = `"${row.positive.replace(/"/g, '""')}"`;
          const neg = `"${row.negative.replace(/"/g, '""')}"`;
          return `${row.number},${pos},${neg}`;
        }).join('\n');

        setRows(loadedRows);
        setCurrentFile(file.name);
        
        // Save to localStorage immediately when file is loaded
        console.log('Saving to localStorage with key:', `csv_data_${file.name}`);
        console.log('Loaded rows count:', loadedRows.length);
        localStorage.setItem(`csv_data_${file.name}`, csvContent);
        localStorage.setItem('csv_default_file_path', file.name);
        // Store the full path if available (for Electron file saving)
        if ((file as any).path) {
          localStorage.setItem(`csv_file_path_${file.name}`, (file as any).path);
        }
        
        updateStatus(`Loaded: ${file.name} (${loadedRows.length} rows)`, 'gray');
        setSelectedRowId(null);
        clearEditForm();
      } catch (error) {
        console.error('CSV load error:', error);
        alert(`Could not load CSV: ${error}`);
      }
    };
    reader.readAsText(file);
  };

  // Toggle auto-save
  const toggleAutoSave = () => {
    if (!autoSave && !currentFile) {
      updateStatus('Save a file or set default first', 'orange');
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
          
          <button 
            className="csv-btn" 
            onClick={setAsDefaultFile}
            title="Set current file as default for auto-save"
          >
            ⭐ Set Default
          </button>
          
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
                onChange={(e) => {
                  setEditPositive(e.target.value);
                  updateFromForm('positive', e.target.value);
                }}
                placeholder="Enter positive prompt"
                disabled={!selectedRowId}
                rows={8}
              />
            </div>

            <div className="csv-form-group">
              <label>Negative:</label>
              <textarea
                value={editNegative}
                onChange={(e) => {
                  setEditNegative(e.target.value);
                  updateFromForm('negative', e.target.value);
                }}
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
