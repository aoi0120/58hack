const { withEntitlementsPlist } = require("@expo/config-plugins");

module.exports = function withHealthKit(config) {
    return withEntitlementsPlist(config, (config) => {
        const entries = config.modResults;

        entries["com.apple.developer.healthkit"] = true;

        return config;
    });
};
