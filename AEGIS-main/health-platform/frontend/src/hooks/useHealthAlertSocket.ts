import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useStore } from '../stores/useStore';
import { useNotificationStore } from '../stores/useNotificationStore';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8082/ws-alerts';

export const useHealthAlertSocket = () => {
    const addAlert = useStore((state) => state.addAlert);
    const selectedCountry = useStore((state) => state.selectedCountry);
    const clientRef = useRef<Client | null>(null);
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('Connected to health alerts WebSocket');

            
            client.subscribe('/topic/health-alerts', (message) => {
                if (message.body) {
                    try {
                        const alertData = JSON.parse(message.body);
                        addAlert({
                            id: crypto.randomUUID(),
                            country: alertData.countryCode || 'GLOBAL',
                            message: alertData.message || 'New global health event detected',
                            timestamp: alertData.timestamp || new Date().toISOString(),
                            type: alertData.severity?.toLowerCase() || 'info',
                            source: alertData.source || 'SYSTEM'
                        });
                        
                        useNotificationStore.getState().addNotification({
                            type: 'alert',
                            title: 'Health Alert',
                            message: alertData.message || 'New global health event detected',
                            country: alertData.countryCode || 'GLOBAL',
                            countryCode: alertData.countryCode,
                        });
                    } catch (e) {
                        console.error('Failed to parse incoming alert message', e);
                    }
                }
            });

            
            
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [addAlert]);

    
    useEffect(() => {
        if (!clientRef.current || !clientRef.current.connected || !selectedCountry) return;

        const sub = clientRef.current.subscribe(`/topic/country/${selectedCountry.code}`, (message) => {
            if (message.body) {
                const alertData = JSON.parse(message.body);
                addAlert({
                    id: crypto.randomUUID(),
                    country: selectedCountry.code,
                    message: `FOCUS EVENT: ${alertData.message}`,
                    timestamp: alertData.timestamp || new Date().toISOString(),
                    type: 'critical', 
                    source: alertData.source || 'SYSTEM'
                });
            }
        });

        return () => {
            sub.unsubscribe();
        };
    }, [selectedCountry, addAlert]);
};