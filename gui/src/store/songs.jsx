import {create} from 'zustand';
const API_URL = "/api";

export const useSongsStore = create((set) => ({
    song: [],
    error: null,
    loading: false,
    

    getSong : async () =>{
        set({loading: true,error: null});
        try {
            const response = await fetch(`${API_URL}/songs?code=4351`);
            const data = await response.json();
            set({loading: false,error: null,song: data});
        } catch (error) {
            console.log('Error fetching song:', error);
            set({error: 'Failed to fetch song', loading: false});
        }
    }
}));