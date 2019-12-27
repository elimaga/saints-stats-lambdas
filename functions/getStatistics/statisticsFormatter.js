function formatStatisticsForUi(statistics) {
    let statsForEachPlayer = [];

    let playerStats = {};
    statistics.forEach(statistic => {
        if (statistic.Number === playerStats.Number) {
            playerStats[statistic.Abbreviation] = statistic.Value;
        } else {
            playerStats = {};
            statsForEachPlayer.push(playerStats);
            playerStats.Number = statistic.Number;
            playerStats.Name = statistic.Name;
            playerStats[statistic.Abbreviation] = statistic.Value;
        }
    });

    return statsForEachPlayer;
}

module.exports = {
    formatStatisticsForUi
};