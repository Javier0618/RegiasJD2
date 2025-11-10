<?php
// api/get_slots.php

require_once '../db.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM available_slots WHERE is_active = 1");
    $slots = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($slots);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
