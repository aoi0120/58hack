const {
    withEntitlementsPlist,
    withInfoPlist,
    createRunOncePlugin,
} = require("@expo/config-plugins");

const withHealthKit = (config) => {
    config = withInfoPlist(config, (c) => {
        c.modResults.NSHealthShareUsageDescription =
            c.modResults.NSHealthShareUsageDescription || "ヘルスケアのデータを読み取ります。";
        c.modResults.NSHealthUpdateUsageDescription =
            c.modResults.NSHealthUpdateUsageDescription || "ワークアウト等のデータを書き込みます。";
        return c;
    });

    config = withEntitlementsPlist(config, (c) => {
        c.modResults["com.apple.developer.healthkit"] = true;
        return c;
    });

    return config;
};

module.exports = createRunOncePlugin(withHealthKit, "with-healthkit", "1.0.0");
