import React from 'react';
import { Modal } from './ui';
import './KeyboardShortcutsModal.css';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  category: string;
  shortcuts: Shortcut[];
}

const shortcuts: ShortcutCategory[] = [
  {
    category: 'Navigation',
    shortcuts: [
      { keys: ['←', '→'], description: 'Previous/Next step' },
      { keys: ['Ctrl', 'Home'], description: 'Jump to first step' },
      { keys: ['Ctrl', 'End'], description: 'Jump to last step' },
      { keys: ['Esc'], description: 'Close modal/dialog' },
    ],
  },
  {
    category: 'Actions',
    shortcuts: [
      { keys: ['Ctrl', 'R'], description: 'Randomize current step' },
      { keys: ['Ctrl', 'Shift', 'R'], description: 'Randomize all unlocked steps' },
      { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
      { keys: ['Ctrl', 'Y'], description: 'Redo action' },
      { keys: ['Ctrl', 'S'], description: 'Save current project' },
      { keys: ['Ctrl', 'C'], description: 'Copy final prompt' },
    ],
  },
  {
    category: 'Editing',
    shortcuts: [
      { keys: ['Tab'], description: 'Move to next field' },
      { keys: ['Shift', 'Tab'], description: 'Move to previous field' },
      { keys: ['Enter'], description: 'Confirm input/selection' },
      { keys: ['Ctrl', 'L'], description: 'Toggle step lock' },
    ],
  },
  {
    category: 'View',
    shortcuts: [
      { keys: ['Ctrl', 'P'], description: 'Toggle preview sidebar' },
      { keys: ['Ctrl', 'H'], description: 'Toggle chat panel' },
      { keys: ['Ctrl', '='], description: 'Increase preview font size' },
      { keys: ['Ctrl', '-'], description: 'Decrease preview font size' },
    ],
  },
  {
    category: 'Quick Access',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Open quick search' },
      { keys: ['Ctrl', 'Shift', 'P'], description: 'Open projects' },
      { keys: ['Ctrl', 'Shift', 'H'], description: 'Open history' },
      { keys: ['Ctrl', ','], description: 'Open settings' },
      { keys: ['Ctrl', '?'], description: 'Show keyboard shortcuts (this)' },
    ],
  },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="lg">
      <div className="shortcuts-modal">
        <div className="shortcuts-grid">
          {shortcuts.map((category) => (
            <div key={category.category} className="shortcuts-category">
              <h3 className="shortcuts-category__title">{category.category}</h3>
              <div className="shortcuts-list">
                {category.shortcuts.map((shortcut, index) => (
                  <div key={index} className="shortcut-item">
                    <div className="shortcut-item__keys">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="shortcut-plus">+</span>}
                          <kbd className="shortcut-key">{key}</kbd>
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="shortcut-item__description">
                      {shortcut.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="shortcuts-footer">
          <p className="shortcuts-hint">
            Press <kbd className="shortcut-key">Ctrl</kbd> +{' '}
            <kbd className="shortcut-key">?</kbd> anytime to show this dialog
          </p>
        </div>
      </div>
    </Modal>
  );
};
