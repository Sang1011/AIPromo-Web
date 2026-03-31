import { ref, remove } from 'firebase/database';
import { db } from '../config/firebase';

export interface SavedSelection {
    mode: 'zone' | 'seat';
    zone?: {
        areaId: string;
        areaName: string;
        ticketTypeId: string;
        ticketTypeName: string;
        ticketTypeColor: string;
        price: number;
        quantity: number;
    };
    seats?: {
        id: string;
        row: string;
        number: number;
        sectionId: string;
        sectionName: string;
        price: number;
        ticketTypeId: string;
        ticketTypeName: string;
        ticketTypeColor: string;
    }[];
    totalPrice: number;
    savedAt: string;
}

const SELECTION_KEY = 'currentOrderSelection';

export const saveSelectionToLocal = (selection: SavedSelection) => {
    localStorage.setItem(SELECTION_KEY, JSON.stringify(selection));
};

export const loadSelectionFromLocal = (): SavedSelection | null => {
    try {
        const raw = localStorage.getItem(SELECTION_KEY);
        return raw ? (JSON.parse(raw) as SavedSelection) : null;
    } catch {
        return null;
    }
};

export const clearOldOrderFromFirebase = async () => {
    const oldOrderId = localStorage.getItem('currentOrderId');
    if (oldOrderId) {
        await remove(ref(db, `pendingOrders/${oldOrderId}`));
        localStorage.removeItem('currentOrderId');
    }
    localStorage.removeItem(SELECTION_KEY);
};