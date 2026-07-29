const blacklistedPhraseModel = {
    table: "blacklisted_phrases",

    field: {
        phraseId: "phrase_id",
        phrase: "phrase",
        source: "source",
        createdAt: "created_at"
    }
};

module.exports = blacklistedPhraseModel;
