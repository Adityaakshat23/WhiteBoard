import fs from 'fs'

const activeRoomsFilePath = 'src/data/activeRooms.json';

interface ActiveRoom {
    roomId: string;
    expiry: number;
}

let activeRooms: ActiveRoom[] = [];

function loadActiveRooms() {
    try {
        const data = fs.readFileSync(activeRoomsFilePath, 'utf-8');
        if (data) {
            activeRooms = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading active rooms data:', error);
    }
}


function saveActiveRooms() {
    try {
        const data = JSON.stringify(activeRooms, null, 2);
        fs.writeFileSync(activeRoomsFilePath, data, 'utf-8');
    } catch (error) {
        console.error('Error saving active rooms data:', error);
    }
}


function addActiveRoom(roomId: string, expiry: number) {
    activeRooms.push({ roomId, expiry });
    saveActiveRooms();
}


function removeExpiredRooms() {
    const currentTime = Date.now();
    activeRooms = activeRooms.filter(room => room.expiry > currentTime);
    saveActiveRooms();
}

loadActiveRooms();
setInterval(removeExpiredRooms, 360000);

export { activeRooms, addActiveRoom, removeExpiredRooms };