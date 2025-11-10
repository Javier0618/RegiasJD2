<?php
// api/get_services.php

require_once '../db.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM services WHERE is_active = 1 ORDER BY `order` ASC");
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($services);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
