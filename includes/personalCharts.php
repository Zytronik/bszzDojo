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
                    <?php foreach ($chartData as $distance => $records): ?>
                        <div class="tab-wrapper <?php echo $isFirst ? 'active' : ''; ?>" id="chart-<?php echo $distance; ?>">
                            <canvas id="personalHistoryChart-<?php echo $distance; ?>"></canvas>
                            <script>
                                document.addEventListener('DOMContentLoaded', function () {
                                    const ctx = document.getElementById('personalHistoryChart-<?php echo $distance; ?>');
                                    const personalChartData = <?php echo json_encode($chartData[$distance]); ?>;
                                    const labels = personalChartData.map(record => record.createdAt);
                                    const scores = personalChartData.map(record => parseInt(record.result, 10));

                                    new Chart(ctx, {
                                        type: 'line',
                                        data: {
                                            labels: labels,
                                            datasets: [{
                                                label: 'Punkte',
                                                data: scores,
                                                borderWidth: 1,
                                                tension: 0.3,
                                                borderColor: "#e43811",
                                            }]
                                        },
                                        options: {
                                            scales: {
                                                x: {
                                                    display: false,
                                                }
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false
                                                },
                                                tooltip: {
                                                    displayColors: false,
                                                }
                                            }
                                        }
                                    });
                                });


                            </script>
                        </div>
                        <?php $isFirst = false; ?>
                    <?php endforeach; ?>
                <?php } ?>
            </div>
        </div>
    </div>
</section>