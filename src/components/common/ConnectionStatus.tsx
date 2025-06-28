import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, Server, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/api';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<{
    api: 'connected' | 'disconnected' | 'checking';
    database: string;
    lastCheck: string;
  }>({
    api: 'checking',
    database: 'Unknown',
    lastCheck: ''
  });

  const checkConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, api: 'checking' }));
      
      const health = await apiService.healthCheck();
      
      setStatus({
        api: 'connected',
        database: health.database,
        lastCheck: new Date().toLocaleTimeString('pt-BR')
      });
    } catch (error) {
      console.error('Connection check failed:', error);
      setStatus(prev => ({
        ...prev,
        api: 'disconnected',
        lastCheck: new Date().toLocaleTimeString('pt-BR')
      }));
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status.api) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status.api) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'disconnected':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getStatusText = () => {
    switch (status.api) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'checking':
        return 'Verificando...';
    }
  };

  return (
    <div className={`${className}`}>
      <div className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="ml-2">{getStatusText()}</span>
        
        {status.api === 'connected' && (
          <div className="ml-3 flex items-center space-x-2 text-xs">
            <Database className="h-3 w-3" />
            <span>{status.database}</span>
          </div>
        )}
      </div>
      
      {status.lastCheck && (
        <div className="text-xs text-gray-500 mt-1">
          Última verificação: {status.lastCheck}
        </div>
      )}
      
      <button
        onClick={checkConnection}
        className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline"
      >
        Verificar novamente
      </button>
    </div>
  );
};

export default ConnectionStatus;