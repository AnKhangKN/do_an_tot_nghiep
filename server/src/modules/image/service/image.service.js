const { generateUUID } = require("@/utils/uuid.util");
const imageRepository = require("../repository/image.repository");
const imageModel = require("../model/image.model");
const { mapFields } = require("@/utils/mapper.util");

class ImageService {
    constructor() {
        this.imageRepository = imageRepository;
        this.imageModel = imageModel;
    }

    createImage = async (client, { url, entityType, entityId }) => {
        if (!url) return null;
        const imageId = generateUUID();
        const row = await this.imageRepository.createImage(client, {
            imageId,
            url,
            entityType,
            entityId
        });
        return mapFields(row, this.imageModel);
    }
}

module.exports = new ImageService();
