<?php
// api/get_appointments.php

require_once '../db.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM appointments ORDER BY appointment_date DESC");
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($appointments);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
