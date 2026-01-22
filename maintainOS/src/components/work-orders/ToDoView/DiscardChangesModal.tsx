"use client";

import { X, AlertTriangle } from "lucide-react";

interface DiscardChangesModalProps {
  isOpen: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

export function DiscardChangesModal({
  isOpen,
  onKeepEditing,
  onDiscard,
}: DiscardChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        overflow: 'hidden',
        borderRadius: '0.5rem',
        backgroundColor: '#fff',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827'
          }}>
            <AlertTriangle style={{ height: '20px', width: '20px', color: '#ea580c' }} />
            Discard unsaved changes?
          </div>
          <button
            onClick={onKeepEditing}
            style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>
        <div style={{ padding: '0 24px 16px' }}>
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
            If you leave now, you’ll lose unsaved changes to this work order.
          </p>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '0 24px 16px',
          backgroundColor: '#fff'
        }}>
          <button
            onClick={onKeepEditing}
            style={{
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onDiscard}
            style={{
              borderRadius: '0.375rem',
              backgroundColor: '#ea580c',
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}
