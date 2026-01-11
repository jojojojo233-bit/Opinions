import { OpinionsService } from '../lib/OpinionsService';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

export function useOpinions() {
    const { connection } = useConnection();
    
    // Create the service instance
    const service = useMemo(() => {
        const s = new OpinionsService();
        s.connection = connection;
        return s;
    }, [connection]);

    return service;
}
