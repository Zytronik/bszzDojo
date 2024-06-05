<?php $chartData = getChartData($conn, $userId); ?>
<section>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <h2>Entwicklung</h2>
                <?php if (empty($chartData)) { ?>
                    <p>Keine Rekorde vorhanden.</p>
                <?php } else { ?>
                    <div class="tabs">
                        <?php $isFirst = true; ?>
                        <?php foreach ($chartData as $distance => $records): ?>
                            <div class="tab <?php echo $isFirst ? 'active' : ''; ?>"
                                data-tab-id="chart-<?php echo $distance; ?>">
                                <?php echo $distance; ?>m
                            </div>
                            <?php $isFirst = false; ?>
                        <?php endforeach; ?>
                    </div>
                    <?php $isFirst = true; ?>
                    <?php foreach ($chartData as $distance => $bowTypes): ?>
                        <div class="tab-wrapper <?php echo $isFirst ? 'active' : ''; ?>" id="chart-<?php echo $distance; ?>">
                            <canvas id="personalHistoryChart-<?php echo $distance; ?>"></canvas>
                            <script>
                                document.addEventListener('DOMContentLoaded', function () {
                                    const ctx = document.getElementById('personalHistoryChart-<?php echo $distance; ?>');
                                    const personalChartData = <?php echo json_encode($bowTypes); ?>;
                                    const BOW_TYPES = <?php echo json_encode(BOW_TYPES); ?>;
                                    const datasets = [];
                                    Object.keys(personalChartData).forEach(bowType => {
                                        const records = personalChartData[bowType];
                                        const labels = records.map(record => record.createdAt);
                                        const scores = records.map(record => parseInt(record.result, 10));

                                        datasets.push({
                                            label: BOW_TYPES[bowType].name,
                                            data: scores,
                                            borderWidth: 1,
                                            tension: 0.3,
                                            borderColor: BOW_TYPES[bowType].color,
                                            backgroundColor: BOW_TYPES[bowType].color
                                        });
                                    });

                                    new Chart(ctx, {
                                        type: 'line',
                                        data: {
                                            labels: personalChartData[Object.keys(personalChartData)[0]].map(record => record.createdAt),
                                            datasets: datasets,
                                        },
                                        options: {
                                            scales: {
                                                x: {
                                                    display: false,
                                                }
                                            },
                                            plugins: {
                                                legend: {
                                                    display: true
                                                },
                                                tooltip: {
                                                    displayColors: true,
                                                }
                                            }
                                        }
                                    });
                                });

                                function getRandomColor() {
                                    const letters = '0123456789ABCDEF';
                                    let color = '#';
                                    for (let i = 0; i < 6; i++) {
                                        color += letters[Math.floor(Math.random() * 16)];
                                    }
                                    return color;
                                }
                            </script>
                        </div>
                        <?php $isFirst = false; ?>
                    <?php endforeach; ?>
                <?php } ?>
            </div>
        </div>
    </div>
</section>
