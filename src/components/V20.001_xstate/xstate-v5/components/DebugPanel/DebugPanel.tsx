// xstate-v5/components/DebugPanel/DebugPanel.tsx
import React from 'react';
import { useDebugPanel } from '../../hooks/useDebugPanel';

type TabType = 'animations' | 'rendering' | 'materials' | 'performance';

export function DebugPanel() {
  const { isOpen, activeTab, fps, bones, animations, toggle, close, changeTab } = useDebugPanel();

  if (!isOpen) {
    return (
      <button
        onClick={toggle}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '8px 12px',
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 1000
        }}
      >
        Open Debug Panel
      </button>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'animations', label: 'Animations' },
    { id: 'rendering', label: 'Rendering' },
    { id: 'materials', label: 'Materials' },
    { id: 'performance', label: 'Performance' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '320px',
        maxHeight: '80vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        borderRadius: '8px',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Debug Panel</h3>
        <button
          onClick={close}
          style={{
            padding: '4px 8px',
            backgroundColor: '#555',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Close
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid #444', paddingBottom: '8px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => changeTab(tab.id)}
            style={{
              flex: 1,
              padding: '6px 8px',
              backgroundColor: activeTab === tab.id ? '#007acc' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              transition: 'background-color 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'animations' && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#aaa' }}>Animation Statistics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                <span>Animations Loaded:</span>
                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{animations}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                <span>Bones Count:</span>
                <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{bones}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rendering' && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#aaa' }}>Rendering Info</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                <span>FPS:</span>
                <span style={{
                  color: fps > 50 ? '#4ade80' : fps > 30 ? '#facc15' : '#f87171',
                  fontWeight: 'bold'
                }}>
                  {fps.toFixed(1)}
                </span>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Performance</div>
                <div style={{
                  height: '4px',
                  backgroundColor: '#333',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min((fps / 60) * 100, 100)}%`,
                      backgroundColor: fps > 50 ? '#4ade80' : fps > 30 ? '#facc15' : '#f87171',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#aaa' }}>Materials Info</h4>
            <div style={{ padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
                Material controls will be available here
              </p>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#aaa' }}>Performance Metrics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                <span>Current FPS:</span>
                <span style={{
                  color: fps > 50 ? '#4ade80' : fps > 30 ? '#facc15' : '#f87171',
                  fontWeight: 'bold'
                }}>
                  {fps.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                <span>Memory Usage:</span>
                <span style={{ color: '#a78bfa' }}>N/A</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                <span>Draw Calls:</span>
                <span style={{ color: '#a78bfa' }}>N/A</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid #444',
        fontSize: '10px',
        color: '#666',
        textAlign: 'center'
      }}>
        XState v5 Debug Panel
      </div>
    </div>
  );
}
