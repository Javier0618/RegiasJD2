<?php
// api/update_service.php
require_once '../db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $sql = "UPDATE services SET name = ?, duration_minutes = ?, price = ?, category = ?, image_url = ?, description = ?, is_active = ? WHERE id = ?";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['name'],
            $data['duration_minutes'],
            $data['price'],
            $data['category'],
            $data['image_url'] ?? null,
            $data['description'] ?? null,
            $data['is_active'] ? 1 : 0,
            $data['id']
        ]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
