import React, { useEffect, useState } from 'react';
import './update.css';
import Progress from './Progress';

interface UpdateInfo {
  update: boolean;
  version: string;
  newVersion: string;
}

const UpdateModal: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for updates when component mounts
    window.electronAPI.checkUpdate();

    // Listen for update availability
    window.electronAPI.onUpdateAvailable((info: UpdateInfo) => {
      setUpdateInfo(info);
    });

    // Listen for download progress
    window.electronAPI.onDownloadProgress((progressInfo: { percent: number }) => {
      setProgress(Math.round(progressInfo.percent));
    });

    // Listen for download completion
    window.electronAPI.onUpdateDownloaded(() => {
      window.electronAPI.quitAndInstall();
    });

    // Listen for errors
    window.electronAPI.onUpdateError((err: { message: string }) => {
      setError(err.message);
      setDownloading(false);
    });

    return () => {
      // Cleanup listeners
      window.electronAPI.removeAllListeners();
    };
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    setError(null);
    window.electronAPI.startDownload();
  };

  if (!updateInfo?.update) return null;

  return (
    <div className="update-modal">
      <div className="update-content">
        <h2>Update Available</h2>
        <p>A new version ({updateInfo.newVersion}) is available!</p>
        <p>Current version: {updateInfo.version}</p>

        {error && (
          <div className="update-error">
            Error: {error}
          </div>
        )}

        {downloading ? (
          <div className="download-progress">
            <Progress percent={progress} />
            <p>{progress}%</p>
          </div>
        ) : (
          <button
            className="download-button"
            onClick={handleDownload}
            disabled={downloading}
          >
            Download Update
          </button>
        )}
      </div>
    </div>
  );
};

export default UpdateModal;
