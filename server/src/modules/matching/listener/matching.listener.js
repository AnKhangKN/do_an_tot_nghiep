const eventEmitter = require("@/events/eventEmitter");
const matchingService = require("../service/matching.service");
const dispatchService = require("@modules/dispatch/service/dispatcher.service");

eventEmitter.on("SOS_CREATED", async (sos) => {

    const rescuers = await matchingService.findNearbyRescuersForSOS(sos);

    await dispatchService.sendSOS(rescuers, sos);
});