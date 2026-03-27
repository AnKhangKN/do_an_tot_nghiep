const imageModel = {
    table: "images",

    field: {
        imageId: 'image_id',
        url: 'url',

        // nên snake_case cho đồng bộ DB
        entityType: 'entity_type',
        entityId: 'entity_id',

        createdAt: 'created_at'
    }
}

module.exports = imageModel;