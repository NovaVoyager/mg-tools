import { useState } from 'react';
import Sidebar from './menu/Sidebar';
import ImageConverter from './contents/image_converter/ImageConverter';
import JSONTools from './contents/json_tools/JSONTools';
import TimestampConverter from './contents/timestamp/TimestampConverter';

function App() {
  const [activeMenu, setActiveMenu] = useState('image-format');

  const renderContent = () => {
    switch (activeMenu) {
      case 'image-format':
        return <ImageConverter />;
      case 'json-tools':
        return <JSONTools />;
      case 'timestamp':
        return <TimestampConverter />;
      default:
        return <ImageConverter />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0f0f14',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main style={{
        flex: 1,
        padding: '40px',
        overflowY: 'auto',
      }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;