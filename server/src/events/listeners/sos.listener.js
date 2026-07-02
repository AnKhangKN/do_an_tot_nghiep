const eventEmitter = require('../eventEmitter');

eventEmitter.on('sos:created', async (sos) => { 
    console.log('SOS created:', sos);

    // tìm rescuer
    // gửi socket
    // gửi notification

    // const rescuers = await matchingService.findNearbyRescuersForSOS(sos);

    // await dispatchService.sendSOS(rescuers, sos);
});